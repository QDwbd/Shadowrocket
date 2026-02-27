import { deleteConnection } from "@/services/api";
import parseTraffic from "@/utils/parse-traffic";
import { truncateStr } from "@/utils/truncate-str";
import { Box, Button, Snackbar } from "@mui/material";
import { useLockFn } from "ahooks";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface ConnectionDetailRef {
  open: (detail: IConnectionsItem) => void;
}

export const ConnectionDetail = forwardRef<ConnectionDetailRef>(
  (props, ref) => {
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<IConnectionsItem>(null!);

    useImperativeHandle(ref, () => ({
      open: (detail: IConnectionsItem) => {
        if (open) return;
        setOpen(true);
        setDetail(detail);
      },
    }));

    const onClose = () => setOpen(false);

    return (
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={open}
        onClose={onClose}
        message={
          detail ? (
            <InnerConnectionDetail data={detail} onClose={onClose} />
          ) : null
        }
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      />
    );
  }
);

ConnectionDetail.displayName = "ConnectionDetail";

interface InnerProps {
  data: IConnectionsItem;
  onClose?: () => void;
}

const InnerConnectionDetail = ({ data, onClose }: InnerProps) => {
  const { metadata, rulePayload } = data;
  const chains = [...data.chains].reverse().join(" / ");
  const rule = rulePayload ? `${data.rule}(${rulePayload})` : data.rule;
  const host = metadata.host
    ? `${metadata.host}:${metadata.destinationPort}`
    : `${metadata.destinationIP}:${metadata.destinationPort}`;

  const information = [
    { label: "Host", value: host },
    { label: "Download", value: parseTraffic(data.download).join(" ") },
    { label: "Upload", value: parseTraffic(data.upload).join(" ") },
    {
      label: "DL Speed",
      value: parseTraffic(data.curDownload ?? -1).join(" ") + "/s",
    },
    {
      label: "UL Speed",
      value: parseTraffic(data.curUpload ?? -1).join(" ") + "/s",
    },
    { label: "Chains", value: chains },
    { label: "Rule", value: rule },
    {
      label: "Process",
      value: truncateStr(metadata.process || metadata.processPath),
    },
    { label: "Time", value: dayjs(data.start).fromNow() },
    { label: "Source", value: `${metadata.sourceIP}:${metadata.sourcePort}` },
    { label: "Destination IP", value: metadata.destinationIP },
    { label: "Type", value: `${metadata.type}(${metadata.network})` },
  ];

  const onDelete = useLockFn(async () => deleteConnection(data.id));

  return (
    <Box
      sx={{
        userSelect: "text",
        backgroundColor: "transparent",
        padding: 2,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: "transparent",
          borderRadius: 2,
        }}
      >
        {information.map((each) => (
          <div key={each.label}>
            <b>{each.label}</b>: <span>{each.value}</span>
          </div>
        ))}
      </Box>

      <Box sx={{ textAlign: "right", marginTop: 2 }}>
        <Button
          variant="text"
          title="Close Connection"
          onClick={() => {
            onDelete();
            onClose?.();
          }}
          sx={{
            backgroundColor: "transparent",
            color: "white", // 可根据背景颜色更改
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)", // hover 时微透明效果，可调整或移除
            },
          }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};
