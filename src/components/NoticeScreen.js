import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import GavelIcon from "@mui/icons-material/Gavel";
import WarningIcon from "@mui/icons-material/Warning";
import { useNavigate } from "react-router-dom";

function NoticeScreen() {
  const navigate = useNavigate();

  const handleContinue = () => {
    // if (onContinue) {
    //   onContinue(); // App.js에서 상태 변경
    // }
    console.log("체크")
    navigate("/"); // 🚀 "/"로 이동
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Card sx={{ maxWidth: 700, width: "90%", boxShadow: 3, borderRadius: 2 }}>
        <CardHeader
          sx={{ backgroundColor: "#e3f2fd" }}
          title={<Typography variant="h5" fontWeight="bold">📢 이용 안내 (필수 확인)</Typography>}
          subheader={<Typography variant="body1" color="text.secondary">Notice (Required Check)</Typography>}
        />
        <CardContent>
          <List>
            <ListItem>
              <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
              <ListItemText primary="본 서비스는 투자 참고용으로, 투자 조언이나 보장을 제공하지 않습니다."
                            secondary="(This service is for reference only and does not provide investment advice or guarantees.)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><WarningIcon sx={{ color: "#f57c00" }} /></ListItemIcon>
              <ListItemText primary="모든 투자 책임은 사용자에게 있습니다."
                            secondary="(All investment responsibility lies with the user.)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><GavelIcon sx={{ color: "#9c27b0" }} /></ListItemIcon>
              <ListItemText primary="본 서비스는 법적 책임을 지지 않습니다."
                            secondary="(This service does not assume any legal liability.)" />
            </ListItem>
          </List>

          <Box textAlign="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinue} // 🔥 버튼 클릭 시 실행
              sx={{ fontWeight: "bold" }}
            >
              [동의하고 계속하기] / [I Agree and Continue]
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default NoticeScreen;
