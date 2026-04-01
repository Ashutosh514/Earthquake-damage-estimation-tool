// Loader.jsx
import React from "react";
import { MaterialBlending } from "three";

const Loader = () => {
  return (
    <div style={styles.container}>
      <video
        src="/earth.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={styles.video}
      />
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  video: {
    margin: "auto",
    width: "100%",
    height: "fit-content",
  },
};

export default Loader;