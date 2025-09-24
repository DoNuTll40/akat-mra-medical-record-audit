"use client";

import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community'; 
import { AgGridReact } from "ag-grid-react";
import { useTheme } from "next-themes";
import { Sarabun } from "next/font/google";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const sarabun = Sarabun({
    subsets: ["thai"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
    display: "swap",
})

export default function AppDataGrid({ columnDefs, rowData, loading = true, pagination = true, onCellValueChanged, onGridReady }) {

    const { resolvedTheme } = useTheme();
    const [ mounted, setMounted ] = useState(false);

    useEffect(() => setMounted(true), []);

    const themeClass = mounted && resolvedTheme === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

    const myTheme = useMemo(() => {
        return themeQuartz.withParams({
            fontFamily: sarabun.style.fontFamily,
            headerFontFamily: sarabun.style.fontFamily,
            cellFontFamily: sarabun.style.fontFamily,

            fontSize: "16px",
            headerFontSize: "14px",
            cellFontSize: "16px",

            fontWeight: 400,
            headerFontWeight: 400,
            cellFontWeight: 400,
        });
    }, []);
  

    const defaultColDef = useMemo(() => ({
            sortable: true,
            resizable: true,
            flex: 1,
        }),[]
    );

    const thLocale = {
        // pagination
        page: 'หน้า',
        more: 'เพิ่มเติม',
        to: 'ถึง',
        of: 'จาก',
        next: 'ถัดไป',
        last: 'สุดท้าย',
        first: 'แรก',
        previous: 'ก่อนหน้า',
        pageSizeSelectorLabel: "จำนวนแถวต่อหน้า",

        noRowsToShow: 'ไม่มีข้อมูล',

        // loading
        loadingOoo: 'กำลังโหลด...',

        // filter & menu (เติมไว้กันเหนียว)
        selectAll: 'เลือกทั้งหมด',
        searchOoo: 'ค้นหา...',
        applyFilter: 'ใช้ตัวกรอง',
        equals: 'เท่ากับ',
        notEqual: 'ไม่เท่ากับ',
        contains: 'มีคำว่า',
        notContains: 'ไม่มีคำว่า',
        startsWith: 'ขึ้นต้นด้วย',
        endsWith: 'ลงท้ายด้วย',
        andCondition: 'และ',
        orCondition: 'หรือ',
        groupItem: 'กลุ่ม',
        unGroupItem: 'ยกเลิกกลุ่ม',
        groupAnd: 'และ',
        groupOr: 'หรือ',
        groupMain: 'กลุ่มหลัก',
        filterOoo: 'กรอง',
        blank: '(เว้นว่าง)',
        notBlank: 'ไม่เป็นเว้นว่าง',
    };

    return (
        <div style={{ height: '100%', width: '100%' }} className={`${themeClass}`}>
            <AgGridReact 
            rowData={rowData}
            loading={loading}
            paginationPageSize={20}
            paginationPageSizeSelector={[5, 10, 20, 50, 100]}
            columnDefs={columnDefs}
            loadThemeGoogleFonts={true}
            defaultColDef={defaultColDef}
            rowDragManaged={true}
            localeText={thLocale}
            pagination={pagination}
            theme={myTheme}
            rowSelection={"single"}
            onCellValueChanged={onCellValueChanged}
            onGridReady={onGridReady}
            />
        </div>
    )
}
