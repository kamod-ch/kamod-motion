import { render } from "preact";
import { useState } from "preact/hooks";
import { Motion } from "@kamod-ch/motion/motion";
import { Presence } from "@kamod-ch/motion/presence";
import { fade, scale } from "@kamod-ch/motion/presets";
import "@kamod-ch/motion/presets/tokens.css";

function App() {
  const [open, setOpen] = useState(true);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 480 }}>
      <h1 style={{ marginTop: 0 }}>@kamod-ch/motion</h1>
      <p>Minimal Preact + Vite consumer using published workspace entry points.</p>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Dismiss" : "Show"} card
      </button>
      <Presence show={open}>
        <Motion
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #c7d2fe",
            background: "#eef2ff",
          }}
          initial={scale.initial}
          animate={scale.animate}
          exit={fade.exit}
          transition={scale.transition}
        >
          Animated from <code>@kamod-ch/motion/motion</code>
        </Motion>
      </Presence>
    </main>
  );
}

render(<App />, document.getElementById("app")!);
