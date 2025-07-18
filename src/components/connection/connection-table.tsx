import parseTraffic from "@/utils/parse-traffic";
import { truncateStr } from "@/utils/truncate-str";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

interface Props {
  connections: IConnectionsItem[];
  onShowDetail: (data: IConnectionsItem) => void;
}

export const ConnectionTable = (props: Props) => {
  const { connections, onShowDetail } = props;

  const [columnVisible, setColumnVisible] = useState<
    Partial<Record<keyof IConnectionsItem, boolean>>
  >({});

  const columns: GridColDef[] = [
    { field: "host", headerName: "Host", flex: 220, minWidth: 220 },
    {
      field: "download",
      headerName: "Download",
      width: 88,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => parseTraffic(value).join(" "),
    },
    {
      field: "upload",
      headerName: "Upload",
      width: 88,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => parseTraffic(value).join(" "),
    },
    {
      field: "dlSpeed",
      headerName: "DL Speed",
      width: 88,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => parseTraffic(value).join(" ") + "/s",
    },
    {
      field: "ulSpeed",
      headerName: "UL Speed",
      width: 88,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => parseTraffic(value).join(" ") + "/s",
    },
    { field: "chains", headerName: "Chains", flex: 360, minWidth: 360 },
    { field: "rule", headerName: "Rule", flex: 300, minWidth: 250 },
    { field: "process", headerName: "Process", flex: 480, minWidth: 480 },
    {
      field: "time",
      headerName: "Time",
      flex: 120,
      minWidth: 100,
      align: "right",
      headerAlign: "right",
    },
    { field: "source", headerName: "Source", flex: 200, minWidth: 130 },
    {
      field: "destinationIP",
      headerName: "Destination IP",
      flex: 200,
      minWidth: 130,
    },
    { field: "type", headerName: "Type", flex: 160, minWidth: 100 },
  ];

  const connRows = useMemo(() => {
    return connections.map((each) => {
      const { metadata, rulePayload } = each;
      const chains = [...each.chains].reverse().join(" / ");
      const rule = rulePayload ? `${each.rule}(${rulePayload})` : each.rule;

      return {
        id: each.id,
        host: metadata.host
          ? `${metadata.host}:${metadata.destinationPort}`
          : `${metadata.destinationIP}:${metadata.destinationPort}`,
        download: each.download,
        upload: each.upload,
        dlSpeed: each.curDownload,
        ulSpeed: each.curUpload,
        chains,
        rule,
        process: truncateStr(metadata.process || metadata.processPath),
        time: dayjs(each.start).fromNow(),
        source: `${metadata.sourceIP}:${metadata.sourcePort}`,
        destinationIP: metadata.destinationIP,
        type: `${metadata.type}(${metadata.network})`,
        connectionData: each,
      };
    });
  }, [connections]);

  return (
    <DataGrid
      hideFooter
      rows={connRows}
      columns={columns}
      onRowClick={(e) => onShowDetail(e.row.connectionData)}
      density="compact"
      sx={{
        border: "none",
        backgroundColor: "transparent",
        "& .MuiDataGrid-main": {
          backgroundColor: "transparent",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "transparent",
        },
        "& .MuiDataGrid-columnHeader": {
          backgroundColor: "transparent",
        },
        "& .MuiDataGrid-cell": {
          backgroundColor: "transparent",
        },
        "& .MuiDataGrid-row": {
          backgroundColor: "transparent",
        },
        "& .MuiDataGrid-virtualScroller": {
          backgroundColor: "transparent",
        },
        "& .MuiDataGrid-footerContainer": {
          backgroundColor: "transparent",
        },
        "div:focus": {
          outline: "none !important",
        },
      }}
      columnVisibilityModel={columnVisible}
      onColumnVisibilityModelChange={(e) => setColumnVisible(e)}
    />
  );
};
