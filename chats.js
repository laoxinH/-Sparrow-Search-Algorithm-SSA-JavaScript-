import {writeFile, mkdir} from "fs";
import cp from "child_process"

/**
 * 创建图表的工具库
 * @param data : []
 */
export function basicLine(data) {
    let opt = {
        xAxis: {
            type: 'category',
            //data: [0,1,2,3]
        },
        yAxis: {
            type: 'value',
            min : Math.min(...data),
            max : Math.max(...data)
        },
        tooltip: {
            trigger: 'axis'
        },
        series: [
            {
                data: data,
                type: 'line',
            }
        ]
    };

    creatChatsHtml(opt);
}

// 创建图表Html文件
const creatChatsHtml = function (option = {}) {
    let tsxData = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>ECharts</title>
            <!-- 引入刚刚下载的 ECharts 文件 -->
            <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.1/dist/echarts.min.js"></script>
        </head>
        <body>
        <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
        <div id="main" style="width: 600px;height:400px;"></div>
        <script src="chats.js"></script>
        <script type="text/javascript">
            // 基于准备好的dom，初始化echarts实例
            let myChart = echarts.init(document.getElementById('main'));
            let option = ${JSON.stringify(option)};
            myChart.setOption(option);
        </script>
        </body>
        </html>
    `
    writeFile(`./chats.html`, tsxData, (err) => {
        openDefaultBrowser("./chats.html");
    })

}

// 用默认浏览器打开指定图表
const openDefaultBrowser = function (url) {
    let exec = cp.exec;
    switch (process.platform) {
        case "darwin":
            exec('open ' + url);
            break;
        case "win32":
            exec('start ' + url);
            break;
        default:
            exec('xdg-open', [url]);
    }
}
