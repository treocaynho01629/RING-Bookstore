import { useMemo } from "react";
import { MaterialReactTable, useMaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { useTheme, useColorScheme, alpha, useMediaQuery } from "@mui/material";

interface CustomReactTableProps {
  data: any[];
  columns: MRT_ColumnDef<any>[];
  tableOptions: any;
}

/**
 * CustomReactTable - A table component using Material React Table
 *
 * @param {any[]} data - Array of data objects to display in the table
 * @param {MRT_ColumnDef<any>} columns - Array of column definitions for Material React Table
 * @param {Object} tableOptions - Additional options to pass to useMaterialReactTable
 */
export default function CustomReactTable({ data = [], columns = [], tableOptions = {} }: CustomReactTableProps) {
  const theme = useTheme();
  const { mode } = useColorScheme();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Define table object with data and columns passed to it
  const table = useMaterialReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    muiTablePaperProps: {
      elevation: 3,
      sx: {
        height: "100%",
      },
    },
    muiTableContainerProps: ({ table }) => ({
      sx: {
        backgroundColor: theme?.vars?.palette?.background?.default,
        height: "100%",
        maxHeight: `calc(100% - ${table.refs.topToolbarRef.current?.offsetHeight}px - ${table.refs.bottomToolbarRef.current?.offsetHeight}px)`,
      },
    }),
    muiToolbarAlertBannerProps: {
      sx: {
        backgroundColor: `rgba(${theme?.vars?.palette?.primary?.mainChannel} / calc(${theme?.vars?.palette?.action?.hoverOpacity}))`,
      },
    },
    muiTableHeadCellProps: {
      sx: {
        "backgroundColor": theme?.vars?.palette?.action?.hover,
        "borderBottom": `1px solid ${theme?.vars?.palette?.divider}`,

        "& .MuiTableSortLabel-root .MuiTableSortLabel-icon": {
          color: `${theme?.vars?.palette?.text?.secondary} !important`,
        },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        borderBottom: `1px solid ${theme?.vars?.palette?.divider}`,
      },
    },
    mrtTheme: {
      baseBackgroundColor: resolvedMode == "dark" ? "#1c211c" : "#fff",
      pinnedRowBackgroundColor: alpha(theme?.palette?.primary?.main, 0.1),
      selectedRowBackgroundColor: alpha(theme?.palette?.primary?.main, 0.2),
    },
    ...tableOptions,
  });

  return <MaterialReactTable table={table} />;
}
