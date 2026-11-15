import { Fragment, createElement, toChildArray } from "preact";
import type { ComponentChildren, VNode } from "preact";
import { useCallback, useLayoutEffect, useRef, useState } from "preact/hooks";
import { useReducedMotion } from "../hooks/use-reduced-motion.js";
import type { ReducedMotionPolicy } from "../types.js";
import { isDevRuntime } from "../utils/env.js";
import { Presence } from "./Presence.js";

export type PresenceMode = "sync" | "wait";

export interface PresenceListProps {
  /** `sync` enters and exits together. `wait` holds new rows until exits finish. @default "sync" */
  mode?: PresenceMode;
  /** When false, the first set of children mounts without an enter animation. @default true */
  initial?: boolean;
  reducedMotion?: ReducedMotionPolicy;
  /** Called after each removed child has finished exiting. */
  onExitComplete?: () => void;
  children: ComponentChildren;
}

interface Slot {
  key: string;
  show: boolean;
  initial: boolean;
}

interface ListModel {
  slots: Slot[];
  pending: string[];
}

interface ListedChild {
  key: string;
  vnode: VNode;
  keyed: boolean;
}

function isVNode(value: unknown): value is VNode {
  return typeof value === "object" && value !== null && "type" in value;
}

function readChildren(children: ComponentChildren): ListedChild[] {
  return toChildArray(children).flatMap((child, index) => {
    if (!isVNode(child)) {
      return [];
    }

    const keyed = child.key != null && String(child.key) !== "";
    return [
      {
        key: keyed ? String(child.key) : `index-${index}`,
        vnode: child,
        keyed,
      },
    ];
  });
}

function sameModel(left: ListModel, right: ListModel): boolean {
  if (left.pending.length !== right.pending.length || left.slots.length !== right.slots.length) {
    return false;
  }

  if (left.pending.some((key, index) => key !== right.pending[index])) {
    return false;
  }

  return left.slots.every((slot, index) => {
    const other = right.slots[index];
    return (
      other !== undefined &&
      slot.key === other.key &&
      slot.show === other.show &&
      slot.initial === other.initial
    );
  });
}

function orderSlots(previous: Slot[], next: Slot[], nextKeys: readonly string[]): Slot[] {
  const byKey = new Map(next.map((slot) => [slot.key, slot]));
  const ordered: Slot[] = [];
  const seen = new Set<string>();

  for (const slot of previous) {
    const updated = byKey.get(slot.key);
    if (!updated || seen.has(slot.key)) {
      continue;
    }
    ordered.push(updated);
    seen.add(slot.key);
  }

  for (const key of nextKeys) {
    if (seen.has(key)) {
      continue;
    }
    const created = byKey.get(key);
    if (!created) {
      continue;
    }
    ordered.push(created);
    seen.add(key);
  }

  for (const slot of next) {
    if (!seen.has(slot.key)) {
      ordered.push(slot);
    }
  }

  return ordered;
}

function reconcile(
  model: ListModel,
  nextKeys: readonly string[],
  mode: PresenceMode,
  prefersReduced: boolean,
): ListModel {
  const nextSet = new Set(nextKeys);
  let slots = model.slots.map((slot) => {
    if (nextSet.has(slot.key)) {
      return slot.show ? slot : { ...slot, show: true, initial: false };
    }
    return slot.show ? { ...slot, show: false } : slot;
  });

  const known = new Set([...slots.map((slot) => slot.key), ...model.pending]);
  const added = nextKeys.filter((key) => !known.has(key));
  const exiting = slots.some((slot) => !slot.show);
  let pending = model.pending.filter(
    (key) => nextSet.has(key) && !slots.some((slot) => slot.key === key && slot.show),
  );

  if (mode === "wait" && exiting && !prefersReduced) {
    for (const key of added) {
      if (!pending.includes(key)) {
        pending.push(key);
      }
    }
  } else {
    slots = [...slots, ...added.map((key) => ({ key, show: true, initial: true }))];
    if (!slots.some((slot) => !slot.show) && pending.length > 0) {
      slots = [...slots, ...pending.map((key) => ({ key, show: true, initial: true }))];
      pending = [];
    }
  }

  return {
    slots: orderSlots(model.slots, slots, nextKeys),
    pending,
  };
}

export function PresenceList({
  mode = "sync",
  initial = true,
  reducedMotion,
  onExitComplete,
  children,
}: PresenceListProps) {
  const prefersReduced = useReducedMotion({ policy: reducedMotion });
  const vnodeByKey = useRef(new Map<string, VNode>());
  const keysRef = useRef<string[]>([]);
  const onExitCompleteRef = useRef(onExitComplete);
  const warnedRef = useRef(false);
  onExitCompleteRef.current = onExitComplete;

  const incoming = readChildren(children);
  keysRef.current = incoming.map((item) => item.key);

  if (
    !warnedRef.current &&
    isDevRuntime() &&
    incoming.length > 1 &&
    incoming.some((item) => !item.keyed)
  ) {
    warnedRef.current = true;
    console.warn(
      "PresenceList children need a stable key so an exit animation stays on the row that left.",
    );
  }

  const liveKeys = new Set(incoming.map((item) => item.key));
  for (const item of incoming) {
    vnodeByKey.current.set(item.key, item.vnode);
  }

  const [model, setModel] = useState<ListModel>(() => ({
    slots: incoming.map((item) => ({ key: item.key, show: true, initial })),
    pending: [],
  }));

  const signature = keysRef.current.join("\0");

  useLayoutEffect(() => {
    setModel((current) => {
      const next = reconcile(current, keysRef.current, mode, prefersReduced);
      return sameModel(current, next) ? current : next;
    });
  }, [signature, mode, prefersReduced]);

  const finishExit = useCallback((key: string) => {
    let removed = false;
    setModel((current) => {
      if (!current.slots.some((slot) => slot.key === key && !slot.show)) {
        return current;
      }
      removed = true;
      vnodeByKey.current.delete(key);
      const slots = current.slots.filter((slot) => slot.key !== key);
      const stillExiting = slots.some((slot) => !slot.show);
      if (stillExiting) {
        return { slots, pending: current.pending };
      }
      const released = current.pending
        .filter((pendingKey) => keysRef.current.includes(pendingKey))
        .map((pendingKey) => ({ key: pendingKey, show: true, initial: true }));
      return { slots: [...slots, ...released], pending: [] };
    });
    if (removed) {
      onExitCompleteRef.current?.();
    }
  }, []);

  for (const key of vnodeByKey.current.keys()) {
    if (
      !liveKeys.has(key) &&
      !model.slots.some((slot) => slot.key === key) &&
      !model.pending.includes(key)
    ) {
      vnodeByKey.current.delete(key);
    }
  }

  return createElement(
    Fragment,
    null,
    model.slots.map((slot) => {
      const vnode = vnodeByKey.current.get(slot.key);
      if (!vnode) {
        return null;
      }

      return createElement(Presence, {
        key: slot.key,
        show: slot.show,
        initial: slot.initial,
        reducedMotion,
        onExitComplete: () => finishExit(slot.key),
        children: vnode,
      });
    }),
  );
}
