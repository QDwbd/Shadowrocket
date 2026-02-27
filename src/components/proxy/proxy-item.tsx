import { BaseLoading } from "@/components/base";
import delayManager from "@/services/delay";
import { CheckCircleOutlineRounded } from "@mui/icons-material";
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
  Theme,
  alpha,
  styled,
} from "@mui/material";
import { useLockFn } from "ahooks";
import { useEffect, useState } from "react";

interface Props {
  groupName: string;
  proxy: IProxyItem;
  selected: boolean;
  showType?: boolean;
  sx?: SxProps<Theme>;
  onClick?: (name: string) => void;
}

const Widget = styled(Box)(({ theme }) => ({
  padding: "3px 6px",
  fontSize: 14,
  borderRadius: "4px",
  backgroundColor: "transparent", // 透明背景
  userSelect: "none",
}));

const TypeBox = styled(Box)(({ theme }) => ({
  display: "inline-block",
  border: "1px solid",
  borderColor: alpha(theme.palette.text.secondary, 0.36),
  color: alpha(theme.palette.text.secondary, 0.42),
  borderRadius: 4,
  fontSize: 10,
  marginRight: "4px",
  padding: "0 2px",
  lineHeight: 1.25,
  backgroundColor: "transparent", // 透明背景
}));

export const ProxyItem = (props: Props) => {
  const { groupName, proxy, selected, showType = true, sx, onClick } = props;

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
    <ListItem
      sx={[
        {
          backgroundColor: "transparent", // 透明背景
        },
        sx,
      ]}
      disablePadding
    >
      <ListItemButton
        dense
        selected={selected}
        onClick={() => onClick?.(proxy.name)}
        sx={[
          {
            borderRadius: 7,
            backgroundColor: "transparent", // 透明背景
            "&.Mui-selected": {
              bgcolor: (theme) =>
                theme.palette.mode === "light"
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.primary.main, 0.35),
            },
            "&:hover": {
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.25),
            },
          },
          ({ palette: { mode, primary } }) => {
            const showDelay = delay > 0;
            return {
              "&:hover .the-check": { display: !showDelay ? "block" : "none" },
              "&:hover .the-delay": { display: showDelay ? "block" : "none" },
              "&:hover .the-icon": { display: "none" },
              "&.Mui-selected .MuiListItemText-secondary": {
                color: mode === "light" ? primary.main : primary.light,
              },
            };
          },
        ]}
      >
        <ListItemText
          title={proxy.name}
          secondary={
            <>
              <span style={{ marginRight: 4 }}>{proxy.name}</span>

              {showType && !!proxy.provider && (
                <TypeBox component="span">{proxy.provider}</TypeBox>
              )}
              {showType && <TypeBox component="span">{proxy.type}</TypeBox>}
              {showType && proxy.udp && <TypeBox component="span">UDP</TypeBox>}
            </>
          }
        />

        <ListItemIcon
          sx={{ justifyContent: "flex-end", color: "primary.main", minWidth: 40 }}
        >
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
              sx={{ fontSize: 16 }}
            />
          )}
        </ListItemIcon>
      </ListItemButton>
    </ListItem>
  );
};
