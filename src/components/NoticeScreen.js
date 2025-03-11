import React from "react";
import { useNavigate } from "react-router-dom";
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

function NoticeScreen({ onContinue }) {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    // 필요 시 상위 컴포넌트의 onContinue 콜백 호출
    if (onContinue) onContinue();
    // 그리고 "/" 경로로 이동하여 대시보드 표시
    navigate("/");
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
      <Card
        sx={{
          maxWidth: 700,
          width: "90%",
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <CardHeader
          sx={{ backgroundColor: "#e3f2fd" }}
          title={
            <Typography variant="h5" component="div" fontWeight="bold">
              📢 이용 안내 (필수 확인)
            </Typography>
          }
          subheader={
            <Typography variant="body1" color="text.secondary">
              Notice (Required Check)
            </Typography>
          }
        />
        <CardContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="본 서비스는 투자 참고용으로, 투자 조언이나 보장을 제공하지 않습니다."
                secondary="(This service is for reference only and does not provide investment advice or guarantees.)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <WarningIcon sx={{ color: "#f57c00" }} />
              </ListItemIcon>
              <ListItemText
                primary="모든 투자 책임은 사용자에게 있습니다."
                secondary="(All investment responsibility lies with the user.)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <WarningIcon sx={{ color: "#f57c00" }} />
              </ListItemIcon>
              <ListItemText
                primary="코인 가격은 변동성이 매우 큽니다."
                secondary="(Cryptocurrency prices are highly volatile.)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="데이터 지연 혹은 부정확 가능성이 있습니다."
                secondary="(There may be data delays or inaccuracies.)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GavelIcon sx={{ color: "#9c27b0" }} />
              </ListItemIcon>
              <ListItemText
                primary="본 서비스는 법적 책임을 지지 않습니다."
                secondary="(This service does not assume any legal liability.)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="위 내용을 확인하였으며, 본인의 판단하에 서비스를 이용하겠습니다."
                secondary="(I have read the above and will use this service at my own discretion.)"
              />
            </ListItem>
          </List>
          <Box textAlign="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
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
