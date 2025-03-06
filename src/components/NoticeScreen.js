import React from "react";
// MUI 컴포넌트들 임포트
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
// MUI 아이콘 임포트 (원하는 아이콘 골라 사용 가능)
import InfoIcon from "@mui/icons-material/Info";
import GavelIcon from "@mui/icons-material/Gavel";
import WarningIcon from "@mui/icons-material/Warning";

function NoticeScreen({ handleContinue }) {
  return (
    <Box
      sx={{
        // 화면 중앙 정렬
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        backgroundColor: "#f5f5f5", // 살짝 회색 배경
      }}
    >
      <Card
        sx={{
          maxWidth: 700, // 카드 최대 너비
          width: "90%", // 화면 좁으면 꽉 채우기
          boxShadow: 3, // 그림자
          borderRadius: 2, // 모서리 둥글게
        }}
      >
        {/* 헤더 */}
        <CardHeader
          sx={{ backgroundColor: "#e3f2fd" }} // 연한 하늘색 배경
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

        {/* 내용 */}
        <CardContent>
          <List>
            {/* 안내 항목 1 */}
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="본 서비스는 투자 참고용으로, 투자 조언이나 보장을 제공하지 않습니다."
                secondary="(This service is for reference only and does not provide investment advice or guarantees.)"
              />
            </ListItem>

            {/* 안내 항목 2 */}
            <ListItem>
              <ListItemIcon>
                <WarningIcon sx={{ color: "#f57c00" }} />
              </ListItemIcon>
              <ListItemText
                primary="모든 투자 책임은 사용자에게 있습니다."
                secondary="(All investment responsibility lies with the user.)"
              />
            </ListItem>

            {/* 안내 항목 3 */}
            <ListItem>
              <ListItemIcon>
                <WarningIcon sx={{ color: "#f57c00" }} />
              </ListItemIcon>
              <ListItemText
                primary="코인 가격은 변동성이 매우 큽니다."
                secondary="(Cryptocurrency prices are highly volatile.)"
              />
            </ListItem>

            {/* 안내 항목 4 */}
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="데이터 지연 혹은 부정확 가능성이 있습니다."
                secondary="(There may be data delays or inaccuracies.)"
              />
            </ListItem>

            {/* 안내 항목 5 */}
            <ListItem>
              <ListItemIcon>
                <GavelIcon sx={{ color: "#9c27b0" }} />
              </ListItemIcon>
              <ListItemText
                primary="본 서비스는 법적 책임을 지지 않습니다."
                secondary="(This service does not assume any legal liability.)"
              />
            </ListItem>

            {/* 안내 항목 6 */}
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

          {/* 동의 버튼 */}
          <Box textAlign="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinue}
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
