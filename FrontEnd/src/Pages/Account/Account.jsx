import * as React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import { toast } from "react-toastify";
import { useProjectContext } from "Utils/Context";
import api, { logout } from "axiosInstance";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "480px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const PageContainer = styled(Stack)(({ theme }) => ({
  marginTop: "100px",
  minHeight: "60vh",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

const ROLES = ["Parent", "Trainer", "Caretaker"];

function AvatarUpload({ user, onUploaded }) {
  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const res = await api.post("/auth/avatar", formData);
      onUploaded(res.data.pfp);
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not upload profile picture",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar src={user.pfp} sx={{ width: 64, height: 64 }} />
      <Box>
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography>
        <Button
          size="small"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          sx={{ mt: 0.5, p: 0, minWidth: 0, textTransform: "none" }}
        >
          {uploading ? "Uploading…" : "Upload photo"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Box>
    </Box>
  );
}

function RoleSection({ user }) {
  const [role, setRole] = React.useState(user.role || "");
  const [saving, setSaving] = React.useState(false);

  const handleChange = async (event) => {
    const next = event.target.value;
    const prev = role;
    setRole(next);
    setSaving(true);
    try {
      await api.patch("/auth/profile", { role: next });
      toast.success("Profile updated");
    } catch (err) {
      setRole(prev);
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        I am a...
      </Typography>
      <FormControl disabled={saving}>
        <RadioGroup row value={role} onChange={handleChange}>
          {ROLES.map((r) => (
            <FormControlLabel key={r} value={r} control={<Radio />} label={r} />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
}

function ChangePasswordSection({ hasPassword }) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success(hasPassword ? "Password changed" : "Password set");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {hasPassword ? "Change password" : "Set a password"}
      </Typography>
      <Stack spacing={2}>
        {hasPassword && (
          <FormControl>
            <FormLabel htmlFor="currentPassword">Current password</FormLabel>
            <TextField
              id="currentPassword"
              type="password"
              size="small"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FormControl>
        )}
        <FormControl>
          <FormLabel htmlFor="newPassword">New password</FormLabel>
          <TextField
            id="newPassword"
            type="password"
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="confirmPassword">Confirm new password</FormLabel>
          <TextField
            id="confirmPassword"
            type="password"
            size="small"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </FormControl>
        <Button type="submit" variant="contained" disabled={submitting}>
          {hasPassword ? "Update password" : "Set password"}
        </Button>
      </Stack>
    </Box>
  );
}

export default function Account() {
  const { user, loggedIn, loading, refreshUser } = useProjectContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !loggedIn) {
      navigate("/login", { replace: true });
    }
  }, [loading, loggedIn, navigate]);

  const handleSignOut = async () => {
    await logout();
    toast.success("Logged Out Successfully");
    window.location.href = "/login";
  };

  if (loading || !user) {
    return <PageContainer />;
  }

  return (
    <PageContainer direction="column" justifyContent="space-between">
      <Card variant="outlined">
        <Typography component="h1" variant="h4" sx={{ width: "100%" }}>
          Settings
        </Typography>

        <AvatarUpload user={user} onUploaded={refreshUser} />

        <Divider />

        <RoleSection user={user} />

        <Divider />

        <ChangePasswordSection hasPassword={!!user.hasPassword} />

        <Divider />

        <Button
          color="error"
          variant="outlined"
          fullWidth
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Card>
    </PageContainer>
  );
}
