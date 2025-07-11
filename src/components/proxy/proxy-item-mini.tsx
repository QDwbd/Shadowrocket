import { BaseLoading } from "@/components/base";
import delayManager from "@/services/delay";
import { CheckCircleOutlineRounded } from "@mui/icons-material";
import { Box, ListItemButton, Typography, alpha, styled } from "@mui/material";
import { useLockFn } from "ahooks";
import { useEffect, useState } from "react";

interface Props {
  groupName: string;
  proxy: IProxyItem;
  selected: boolean;
  showType?: boolean;
  onClick?: (name: string) => void;
}

// 多列布局
export const ProxyItemMini = (props: Props) => {
  const { groupName, proxy, selected, showType = true, onClick } = props;

  // -1/<=0 为 不显示
  // -2 为 loading
  const [delay, setDelay] = useState(-1);

  useEffect(() => {
    delayManager.setListener(proxy.name, groupName, setDelay);

    return () => {
      delayManager.removeListener(proxy.name, groupName);
    };
  }, [proxy.name, groupName]);

  useEffect(() => {
    if (!proxy) return;
    setDelay(delayManager.getDelayFix(proxy, groupName));
  }, [proxy]);

  const onDelay = useLockFn(async () => {
    setDelay(-2);
    setDelay(await delayManager.checkDelay(proxy.name, groupName));
  });

  return (
    <ListItemButton
      dense
      selected={selected}
      onClick={() => onClick?.(proxy.name)}
      sx={[
        {
          height: 56,
          borderRadius: 7,
          pl: 2,
          pr: 1,
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "transparent", // 完全透明背景
          boxShadow: "none", // 去除阴影
        },
        ({ palette: { mode, primary } }) => {
          const bgcolor =
            mode === "light"
              ? alpha(primary.main, 0.15)
              : alpha(primary.main, 0.35);
          const color = mode === "light" ? primary.main : primary.light;
          const showDelay = delay > 0;

          return {
            "&:hover .the-check": { display: !showDelay ? "block" : "none" },
            "&:hover .the-delay": { display: showDelay ? "block" : "none" },
            "&:hover .the-icon": { display: "none" },
            "&.Mui-selected": {
              bgcolor, // 选中时透明高亮背景
              boxShadow: `0 0 0 1px ${bgcolor}`, // 选中时有边框色彩，透明效果
            },
            "&.Mui-selected .MuiListItemText-secondary": { color },
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? alpha(primary.main, 0.1)
                  : alpha(primary.main, 0.25),
            },
          };
        },
      ]}
    >
      <Box title={proxy.name} sx={{ overflow: "hidden" }}>
        <Typography
          variant="body2"
          component="div"
          color="text.secondary"
          sx={{
            display: "block",
            textOverflow: "ellipsis",
            wordBreak: "break-all",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {proxy.name}
        </Typography>

        {showType && (
          <Box sx={{ display: "flex", flexWrap: "nowrap", flex: "none" }}>
            {!!proxy.provider && (
              <TypeBox component="span">{proxy.provider}</TypeBox>
            )}
            <TypeBox component="span">{proxy.type}</TypeBox>
            {proxy.udp && <TypeBox component="span">UDP</TypeBox>}
          </Box>
        )}
      </Box>

      <Box sx={{ ml: 0.5, color: "primary.main" }}>
        {delay === -2 && (
          <Widget>
            <BaseLoading />
          </Widget>
        )}

        {!proxy.provider && delay !== -2 && (
          <Widget
            className="the-check"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelay();
            }}
            sx={({ palette }) => ({
              display: "none", // hover才显示
              ":hover": { bgcolor: alpha(palette.primary.main, 0.15) },
              backgroundColor: "transparent", // 透明背景
            })}
          >
            Check
          </Widget>
        )}

        {delay > 0 && (
          <Widget
            className="the-delay"
            onClick={(e) => {
              if (proxy.provider) return;
              e.preventDefault();
              e.stopPropagation();
              onDelay();
            }}
            color={delayManager.formatDelayColor(delay)}
            sx={({ palette }) =>
              !proxy.provider
                ? { ":hover": { bgcolor: alpha(palette.primary.main, 0.15) } }
                : {}
            }
          >
            {delayManager.formatDelay(delay)}
          </Widget>
        )}

        {delay !== -2 && delay <= 0 && selected && (
          <CheckCircleOutlineRounded
            className="the-icon"
            sx={{ fontSize: 16, mr: 0.5, display: "block" }}
          />
        )}
      </Box>
    </ListItemButton>
  );
};

const Widget = styled(Box)(({ theme: { typography } }) => ({
  padding: "3px 6px",
  fontSize: 14,
  fontFamily: typography.fontFamily,
  borderRadius: "4px",
  backgroundColor: "transparent", // 透明背景
  userSelect: "none",
}));

const TypeBox = styled(Box)(({ theme: { palette, typography } }) => ({
  display: "inline-block",
  border: "1px solid",
  borderColor: alpha(palette.text.secondary, 0.36),
  color: alpha(palette.text.secondary, 0.42),
  borderRadius: 4,
  fontSize: 10,
  fontFamily: typography.fontFamily,
  marginRight: "4px",
  padding: "0 2px",
  lineHeight: 1.25,
  backgroundColor: "transparent", // 透明背景
}));
