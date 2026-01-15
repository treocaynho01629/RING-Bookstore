import { Paper } from "@mui/material";

const WelcomeCard = ({ username }: { username: string }) => {
  return (
    <Paper elevation={3} sx={{ padding: 3, height: "100%" }}>
      <h3>Chào mừng {username}</h3>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus auctor blandit nisl, nec volutpat lacus
        pellentesque eu. Sed tempus tincidunt enim, et sollicitudin mi convallis at.
      </p>
    </Paper>
  );
};

export default WelcomeCard;
