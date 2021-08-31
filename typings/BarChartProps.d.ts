/**
 * This file was generated from BarChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { CSSProperties } from "react";
import { ActionValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type BarChartModeEnum = "basicBar" | "StackedPolarBar" | "RStackedPolarBar" | "RoundedPolarBar";

export interface MyObjectType {
    seriesName: string;
    seriesDataSource: ListValue;
    xValueAttribute: ListAttributeValue<string | Big | Date>;
    yValueAttribute: ListAttributeValue<Big>;
    showLable: boolean;
    stackbar: boolean;
    stackName: string;
    barColor: string;
    borderColor: string;
    borderWidth: number;
    showBackground: boolean;
    onBarClick?: ActionValue;
    BarJsondata: string;
}

export type ChartThemeEnum = "default" | "light" | "dark";

export type ShowLegendWayEnum = "horizontal" | "vertical";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface MyObjectPreviewType {
    seriesName: string;
    seriesDataSource: {} | { type: string } | null;
    xValueAttribute: string;
    yValueAttribute: string;
    showLable: boolean;
    stackbar: boolean;
    stackName: string;
    barColor: string;
    borderColor: string;
    borderWidth: number | null;
    showBackground: boolean;
    onBarClick: {} | null;
    BarJsondata: string;
}

export interface BarChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    ChartTitle: string;
    mysubtitle: string;
    barChartMode: BarChartModeEnum;
    RoundedPolarBarAngle: number;
    myObject: MyObjectType[];
    ChartTheme: ChartThemeEnum;
    XLabel: string;
    YLabel: string;
    ShowLegend: boolean;
    ShowLegendWay: ShowLegendWayEnum;
    ShowChartVertical: boolean;
    showDatazoom: boolean;
    showLoading: boolean;
    loadingTime: number;
    Jsondata: string;
    onChartLegendselectchanged?: ActionValue;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
}

export interface BarChartPreviewProps {
    class: string;
    style: string;
    ChartTitle: string;
    mysubtitle: string;
    barChartMode: BarChartModeEnum;
    RoundedPolarBarAngle: number | null;
    myObject: MyObjectPreviewType[];
    ChartTheme: ChartThemeEnum;
    XLabel: string;
    YLabel: string;
    ShowLegend: boolean;
    ShowLegendWay: ShowLegendWayEnum;
    ShowChartVertical: boolean;
    showDatazoom: boolean;
    showLoading: boolean;
    loadingTime: number | null;
    Jsondata: string;
    onChartLegendselectchanged: {} | null;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
}
