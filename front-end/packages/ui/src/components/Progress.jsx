import LinearProgress from "@mui/material/LinearProgress";

export default function Progress(props) {
  return (
    <div
      style={{
        height: "4px",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
      }}
    >
      <LinearProgress {...props} />
    </div>
  );
}
