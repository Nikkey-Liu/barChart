import React, { Component, ReactNode, createElement } from "react";
// import { HelloWorldSample } from "./components/HelloWorldSample";
import deepMerge from "deepmerge";
import EChartsReact from "echarts-for-react";
import { BarChartContainerProps, MyObjectType } from "../typings/BarChartProps";
import { ValueStatus } from "mendix";
import "./ui/BarChart.css";

export default class BarChart extends Component<BarChartContainerProps> {
    private echartsReact: any = undefined;
    private countSeries = 0; // 计算多少个Series
    private datasetList: any[] = []; // 存储json list 的dataset
    private seriesName: string[] = []; // 存储seriesName
    private seriesList: any[] = []; // 存储Series json list
    private legendType = "";
    private totalValueList = new Set(); // 用于设置点击事件后局部显示设定
    private listFlag = false;
    private barNameToAction = new Map(); // 用于点击事件单个bar series 的设定
    private maxnumber = 0; // 用于调整极坐标下的圆周

    constructor(props: BarChartContainerProps) {
        super(props);
        this.echartsReact = React.createRef();
        this.getOption = this.getOption.bind(this);
        this.getDataSetByDimension = this.getDataSetByDimension.bind(this);
        this.getSeriesItemOption = this.getSeriesItemOption.bind(this);
        this.onChartLegendselectchanged = this.onChartLegendselectchanged.bind(this);
        this.onChartClick = this.onChartClick.bind(this);
    }
    componentDidUpdate() {
        this.clearData();
        let numberObject = 0;
        // 数据加载状态更新
        this.props.myObject.forEach(item => {
            if (item.seriesDataSource.status === ValueStatus.Available) {
                numberObject++;
                if (numberObject === this.props.myObject.length) {
                    this.listFlag = true;
                }
            }
        });
        // 当数据状态为available的时候读取 防止多次读取
        if (this.listFlag) {
            this.props.myObject.forEach(item => {
                this.seriesName.push(
                    item.seriesName === "" || item.seriesName === null ? "series" + this.countSeries : item.seriesName
                );

                if (item.onBarClick != null && item.onBarClick.canExecute) {
                    this.barNameToAction.set(
                        item.seriesName === "" || item.seriesName === null
                            ? "series" + this.countSeries
                            : item.seriesName,
                        item.onBarClick
                    );
                }

                if (this.countSeries === 0) {
                    if (item.seriesDataSource.status === ValueStatus.Available) {
                        this.datasetList[this.countSeries] = this.getDataSetByDimension(item, false);
                        this.seriesList[this.countSeries] = this.getSeriesItemOption(this.countSeries, item);
                    }
                } else {
                    if (item.seriesDataSource.status === ValueStatus.Available) {
                        this.datasetList.push(this.getDataSetByDimension(item, false));
                        this.seriesList.push(this.getSeriesItemOption(this.countSeries, item));
                    }
                }
                this.countSeries = this.countSeries + 1;
            });
        }

        this.legendType = this.countSeries < 5 ? "plain" : "scroll";
        // console.log(this.valueListofMyObject);
        if (
            this.datasetList !== null &&
            this.seriesList !== null &&
            this.seriesName !== null &&
            this.countSeries !== 0
        ) {
            // 判断是否展示加载动画
            if (this.props.showLoading) {
                setTimeout(() => {
                    // 设置加载时间
                    this.echartsReact.getEchartsInstance().hideLoading();
                }, this.props.loadingTime * 1000);
            }
            console.log(this.getOption());
            this.echartsReact.getEchartsInstance().setOption(this.getOption());
        }
        this.countSeries = 0;     // 归零Bar计数
    }
    clearData(){
        while (this.seriesName.length) {
            this.seriesName.pop();
        }
        while (this.seriesList.length){
            this.seriesList.pop();
        }
        while (this.datasetList.length){
            this.datasetList.pop();
        }
    }
    componentWillUnmount() {
        this.clearData();
    }
    // 第一种方式dimension的方式设置dataset来解决不同x 轴bar 的问题
    getDataSetByDimension(item: MyObjectType, sortFlag: boolean) {
        if (sortFlag) {
            return Error;
        }
        const mylist: any[] = [];
        let xValueType = "";
        if (item.seriesDataSource.status === ValueStatus.Available) {
            item.seriesDataSource.items?.forEach(Element => {
                const yValue = item.yValueAttribute.get(Element).value?.toNumber();
                const xValue = item.xValueAttribute.get(Element).value;
                xValueType = typeof item.xValueAttribute.get(Element).value;
                if (typeof yValue === "number" && this.maxnumber < yValue) {
                    this.maxnumber = yValue;
                }
                this.totalValueList.add(xValue);
                const newpoint: any[] = [xValue, yValue];
                mylist.push(newpoint);
            });
        }

        const newDatasetItem = {
            dimensions: [
                xValueType,
                item.seriesName === "" || item.seriesName === null ? "series" + this.countSeries : item.seriesName
            ],
            source: mylist
        };
        return newDatasetItem;
    }

    getSeriesItemOption(indexOfDataset: number, Item: MyObjectType) {
        // 旋转的lable
        const barStylePolarOption = {
            coordinateSystem: "polar"
        };

        // 使用默认color 下的bar style 设置。
        const barStyleOption = {
            itemStyle:
                Item.barColor === ""
                    ? Item.borderColor === ""
                        ? {
                              borderWidth: Item.borderWidth // 都为空
                          }
                        : {
                              borderColor: Item.borderColor,
                              borderWidth: Item.borderWidth // barcolor不为空
                          }
                    : Item.borderColor === ""
                    ? {
                          borderWidth: Item.borderWidth,
                          color: Item.barColor
                      }
                    : {
                          borderColor: Item.borderColor,
                          borderWidth: Item.borderWidth,
                          color: Item.barColor // barcolor不为空
                      }
        };

        // 普通bar 的json series 配置
        let SeriesItemBarOption = Item.stackbar
            ? {
                  name:
                      Item.seriesName === "" || Item.seriesName === null
                          ? "series" + this.countSeries
                          : Item.seriesName,
                  type: "bar",
                  stack: Item.stackName,

                  showBackground: Item.showBackground,
                  label: { show: Item.showLable },
                  datasetIndex: indexOfDataset,
                  emphasis: { focus: "series" }
              }
            : {
                  name:
                      Item.seriesName === "" || Item.seriesName === null
                          ? "series" + this.countSeries
                          : Item.seriesName,
                  type: "bar",
                  // label: this.props.showLabelRotation ? this.labelOption : { show: false },
                  label: { show: Item.showLable },
                  showBackground: Item.showBackground,
                  datasetIndex: indexOfDataset,
                  emphasis: { focus: "series" }
              };
        if (this.props.barChartMode !== "basicBar") {
            SeriesItemBarOption = deepMerge(SeriesItemBarOption, barStyleOption);
            SeriesItemBarOption = deepMerge(SeriesItemBarOption, barStylePolarOption);
        } else {
            SeriesItemBarOption = deepMerge(SeriesItemBarOption, barStyleOption);
        }

        return deepMerge.all(
            [
                SeriesItemBarOption,
                Item.BarJsondata !== null && this.props.Jsondata !== "" ? JSON.parse(Item.BarJsondata) : {}
            ],
            { arrayMerge }
        );
    }
    // getOption 获得最终图形配置json数据；
    getOption() {
        let option = {};
        const datazoomOption = {
            dataZoom: [
                {
                    type: "slider",
                    show: true,
                    xAxisIndex: [0],
                    start: 1,
                    end: 35,
                    bottom: "2%"
                },

                {
                    type: "inside",
                    xAxisIndex: [0],
                    start: 1,
                    end: 35
                }
            ]
        };
        const basicOption = {
            title: {
                text: this.props.ChartTitle,
                subtext: this.props.mysubtitle
            },
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "cross",
                    label: {
                        backgroundColor: "#6a7985"
                    }
                }
            },
            legend: {
                type: this.legendType,
                orient: this.props.ShowLegendWay,
                left: "left",
                show: this.props.ShowLegend,
                top: "8%"
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: "none"
                    },
                    dataView: { readOnly: false },
                    mark: { show: true },
                    magicType: { show: true, type: ["line", "bar", "stack", "tiled"] },

                    saveAsImage: { show: true }
                }
            }
        };
        const datasetOption1 = {
            dataset: this.datasetList
        };
        const seriesOption = {
            series: this.seriesList
        };
        const basicPolarOption = {
            angleAxis: {
                type: "category"
            },
            radiusAxis: {},
            polar: {},
            grid: {
                top: "20%",
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true
            }
        };
        const basicStackedPolarOption = {
            angleAxis: {},
            radiusAxis: {
                type: "category",
                z: 10
            },
            polar: {},
            grid: {
                top: "20%",
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true
            }
        };
        const basicRoundedPolarBarOption = {
            angleAxis: {
                max: this.maxnumber !== 0 ? this.maxnumber : 2,
                startAngle: this.props.RoundedPolarBarAngle,
                splitLine: {
                    show: false
                }
            },
            radiusAxis: {
                type: "category",
                z: 10
            },
            polar: {},
            grid: {
                top: "20%",
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true
            }
        };
        const dataOption = {
            xAxis: [
                {
                    type: this.props.ShowChartVertical ? "value" : "category",

                    name: this.props.XLabel,
                    nameLocation: "center" // 后期开发可作为配置项
                }
            ],
            yAxis: [
                {
                    type: this.props.ShowChartVertical ? "category" : "value",
                    gridIndex: 0,
                    name: this.props.YLabel,
                    nameLocation: "center" // 后期开发可作为配置项
                }
            ],
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true
            }
        };
        if (this.props.showDatazoom) {
            option = deepMerge.all([dataOption, basicOption, datasetOption1, seriesOption, datazoomOption]);
        } else {
            option = deepMerge.all([dataOption, basicOption, datasetOption1, seriesOption]);
        }

        // 根据bar的类型配置option
        switch (this.props.barChartMode) {
            case "StackedPolarBar":
                option = deepMerge.all([basicOption, basicPolarOption, datasetOption1, seriesOption]);
                break;
            case "RStackedPolarBar":
                option = deepMerge.all([basicOption, basicStackedPolarOption, datasetOption1, seriesOption]);
                break;
            case "RoundedPolarBar":
                option = deepMerge.all([basicOption, basicRoundedPolarBarOption, datasetOption1, seriesOption]);
                break;
            default:
                break;
        }

        return (option = deepMerge.all(
            [option, this.props.Jsondata !== null && this.props.Jsondata !== "" ? JSON.parse(this.props.Jsondata) : {}],
            { arrayMerge }
        ));
    }
    renderSizeOfDiv() {
        const mysize = {
            // 声明一个div size对象
            width: "0",
            height: "0",
            widthUnit: "",
            heightUnit: "",
            paddingBottom: "0"
        };
        mysize.width = this.props.widthUnit === "percentage" ? `${this.props.width}%` : `${this.props.width}px`;
        if (this.props.heightUnit === "percentageOfWidth") {
            mysize.paddingBottom =
                this.props.widthUnit === "percentage" ? `${this.props.height}%` : `${this.props.width / 2}px`;
        } else if (this.props.heightUnit === "pixels") {
            mysize.height = `${this.props.height}px`;
        } else if (this.props.heightUnit === "percentageOfParent") {
            mysize.height = `${this.props.height}%`;
        }
        const myDivStyle = {
            height: mysize.height,
            width: mysize.width
        };
        if (mysize.paddingBottom !== "0") {
            const myDivStylep = {
                width: mysize.width,
                paddingBottom: mysize.paddingBottom
            };
            console.log(myDivStylep);
            return myDivStylep;
        }
        console.log(myDivStyle);
        return myDivStyle;
    }
    onChartClick(e: any) {
        const myValueList = Array.from(this.totalValueList);
        const zoomSize = 6;
        this.echartsReact.getEchartsInstance().dispatchAction({
            type: "dataZoom",
            startValue: myValueList[Math.max(e.dataIndex - zoomSize / 2, 0)],
            endValue: myValueList[Math.min(e.dataIndex + zoomSize / 2, myValueList.length - 1)]
        });
        console.log("echarts on click" + e.seriesName);
        if (this.barNameToAction.has(e.seriesName)) {
            this.componentWillUnmount();
            this.barNameToAction.get(e.seriesName).execute();
            console.log(
                "echarts on click execute inform ：如果想点击显示的数据请在外部配置dataview来显示，目前widget执行微流不支持传递参数"
            );
        }
    }
    onChartLegendselectchanged() {
        console.log("legendSlectchanged");
        if (this.props.onChartLegendselectchanged != null && this.props.onChartLegendselectchanged.canExecute) {
            this.componentWillUnmount();
            this.props.onChartLegendselectchanged.execute();
        }
    }
    render(): ReactNode {
        return (
            <EChartsReact
                ref={e => {
                    this.echartsReact = e;
                }}
                option={this.getOption()}
                showLoading={this.props.showLoading} // 获得是否显示loading动画
                style={this.renderSizeOfDiv()}
                theme={this.props.ChartTheme === "default" ? "" : this.props.ChartTheme}
                onEvents={{
                    click: this.onChartClick.bind(this),
                    legendselectchanged: this.onChartLegendselectchanged
                }}
            />
        );
    }
}
// deep meger操作工具函数
const emptyTarget = (value: any) => (Array.isArray(value) ? [] : {});

const clone = (value: any, options: any) => deepMerge(emptyTarget(value), value, options);
const arrayMerge = (target: any[], source: any[], options: any) => {
    const destination = target.slice();

    source.forEach((e, i) => {
        if (typeof destination[i] === "undefined") {
            const cloneRequested = options.clone !== false;
            const shouldClone = cloneRequested && options.isMergeableObject(e);
            destination[i] = shouldClone ? clone(e, options) : e;
        } else if (options.isMergeableObject(e)) {
            destination[i] = deepMerge(target[i], e, options);
        } else if (target.indexOf(e) === -1) {
            destination.push(e);
        }
    });
    return destination;
};
