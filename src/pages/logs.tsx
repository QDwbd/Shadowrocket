import { BaseEmpty, BasePage } from "@/components/base";
import LogItem from "@/components/log/log-item";
import { atomEnableLog, atomLogData } from "@/services/states";
import {
  PauseCircleOutlineRounded,
  PlayCircleOutlineRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";
import { useRecoilState } from "recoil";

export default function LogPage() {
  const { t } = useTranslation();
  const [logData, setLogData] = useRecoilState(atomLogData);
  const [enableLog, setEnableLog] = useRecoilState(atomEnableLog);

  const [logState, setLogState] = useState("all");
  const [filterText, setFilterText] = useState("");

  const filterLogs = useMemo(() => {
    return logData.filter((data) => {
      return (
        data.payload.includes(filterText) &&
        (logState === "all" ? true : data.type.includes(logState))
      );
    });
  }, [logData, logState, filterText]);

  return (
    <BasePage
      full
      title={t("Logs")}
      contentStyle={{ height: "100%", backgroundColor: "transparent" }} // 透明背景
      header={
        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setEnableLog((e) => !e)}
          >
            {enableLog ? (
              <PauseCircleOutlineRounded />
            ) : (
              <PlayCircleOutlineRounded />
            )}
          </IconButton>

          <Button
            size="small"
            variant="contained"
            onClick={() => setLogData([])}
          >
            {t("Clear")}
          </Button>
        </Box>
      }
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "fixed",
          width: "calc(100% - 32px)",
          gap: 1,
          padding: 2,
          zIndex: 10,
          backgroundColor: "transparent", // 这里也设置透明，避免遮挡
        }}
      >
        <Paper
          sx={{
            borderRadius: 7,
            boxShadow: "none",
            backgroundColor: "transparent", // 透明背景
          }}
        >
          <Select
            size="small"
            autoComplete="off"
            value={logState}
            onChange={(e) => setLogState(e.target.value)}
            sx={{
              width: 120,
              height: "36px",
              borderRadius: 7,
              '[role="button"]': { py: 0.65 },
              backgroundColor: "transparent", // 透明背景
            }}
          >
            <MenuItem value="all">ALL</MenuItem>
            <MenuItem value="inf">INFO</MenuItem>
            <MenuItem value="warn">WARN</MenuItem>
            <MenuItem value="err">ERROR</MenuItem>
          </Select>
        </Paper>

        <Paper
          sx={{
            borderRadius: 7,
            boxShadow: "none",
            width: "100%",
            backgroundColor: "transparent", // 透明背景
          }}
        >
          <TextField
            hiddenLabel
            fullWidth
            size="small"
            autoComplete="off"
            spellCheck="false"
            variant="outlined"
            placeholder={t("Filter conditions")}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{ input: { py: 0.65, px: 1.25 }, backgroundColor: "transparent" }}
            InputProps={{
              sx: {
                borderRadius: 7,
                backgroundColor: "transparent", // 透明背景
              },
            }}
          />
        </Paper>
      </Box>

      <Box height="100%" sx={{ backgroundColor: "transparent" }}>
        {filterLogs.length > 0 ? (
          <Virtuoso
            initialTopMostItemIndex={999}
            data={filterLogs}
            itemContent={(index, item) => (
              <LogItem index={index} value={item} />
            )}
            followOutput={"smooth"}
            overscan={900}
            style={{ backgroundColor: "transparent" }} // 透明背景
          />
        ) : (
          <BaseEmpty text="No Logs" />
        )}
      </Box>
    </BasePage>
  );
}
