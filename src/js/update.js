(function () {
"use strict";

window.update = function () {
    console.log("running update stub");
    window.data = parse("&Resources=537236.5:86181.5:329055.166667:186723.15:727592:375000&ResourceRates=8010:8010:9610:1389:1860:13863&Map=36:1738:51&Line_1=1:1:2082598:102:5:1:Y:1:Farm:0&Line_2=1:2:2082598:102:5:1:Y:1:Farm:0&Line_3=1:3:2082598:102:5:1:Y:1:Farm:0&Line_4=1:5:2082598:101:4:5:Y:5:Warehouse:0&Line_5=1:6:2082598:105:3:1:Y:1:Sawmill:0&Line_6=1:7:2082598:105:3:1:Y:1:Sawmill:0&Line_7=1:8:2082598:106:9:2:Y:2:Stone Quarry:0&Line_8=1:9:2082598:106:9:2:Y:2:Stone Quarry:0&Line_9=2:1:2082598:102:5:1:Y:1:Farm:0&Line_10=2:2:2082598:102:5:1:Y:1:Farm:0&Line_11=2:5:2082598:101:4:5:Y:5:Warehouse:0&Line_12=2:6:2082598:105:3:1:Y:1:Sawmill:0&Line_13=2:7:2082598:105:3:1:Y:1:Sawmill:0&Line_14=2:8:2082598:106:9:2:Y:2:Stone Quarry:0&Line_15=2:9:2082598:106:9:2:Y:2:Stone Quarry:0&Line_16=3:1:2082598:102:5:1:Y:1:Farm:0&Line_17=3:3:2082598:102:5:1:Y:1:Farm:0&Line_18=3:6:2082598:105:3:1:Y:1:Sawmill:0&Line_19=3:7:2082598:106:9:1:Y:1:Stone Quarry:0&Line_20=3:8:2082598:104:6:1:Y:1:Iron Mine:0&Line_21=3:9:2082598:104:6:1:Y:1:Iron Mine:0&Line_22=4:6:2082598:106:9:1:Y:1:Stone Quarry:0&Line_23=4:7:2082598:104:6:1:Y:1:Iron Mine:0&Line_24=4:8:2082598:104:6:1:Y:1:Iron Mine:0&Line_25=4:9:2082598:104:6:1:Y:1:Iron Mine:0&Line_26=5:1:2082598:101:4:5:Y:5:Warehouse:0&Line_27=5:2:2082598:101:4:5:Y:5:Warehouse:0&Line_28=5:5:2082598:114:11:10:Y:10:Town Square:0&Line_29=5:8:2082598:101:4:4:Y:4:Warehouse:0&Line_30=5:9:2082598:101:4:5:Y:5:Warehouse:0&Line_31=6:7:2082598:112:8:2:N:2:Stable:298&Line_32=6:8:2082598:101:4:4:Y:4:Warehouse:0&Line_33=6:9:2082598:101:4:5:Y:5:Warehouse:0&Line_34=7:1:2082598:103:2:1:Y:1:Market:0&Line_35=7:3:2082598:103:2:1:Y:1:Market:0&Line_36=7:7:2082598:112:8:5:Y:5:Stable:0&Line_37=7:8:2082598:112:8:11:Y:11:Stable:0&Line_38=7:9:2082598:111:7:1:Y:1:Barracks:0&Line_39=8:1:2082598:103:2:1:Y:1:Market:0&Line_40=8:2:2082598:103:2:1:Y:1:Market:0&Line_41=8:5:2082598:101:4:5:Y:5:Warehouse:0&Line_42=8:7:2082598:112:8:11:Y:11:Stable:0&Line_43=8:8:2082598:112:8:11:Y:11:Stable:0&Line_44=8:9:2082598:111:7:1:Y:1:Barracks:0&Line_45=9:1:2082598:103:2:1:Y:1:Market:0&Line_46=9:2:2082598:103:2:1:Y:1:Market:0&Line_47=9:3:2082598:103:2:1:Y:1:Market:0&Line_48=9:5:2082598:101:4:5:Y:5:Warehouse:0&Line_49=9:7:2082598:112:8:11:Y:11:Stable:0&Line_50=9:8:2082598:112:8:11:Y:11:Stable:0&Line_51=9:9:2082598:111:7:4:Y:4:Barracks:0&Troops=1-1100-0:2-1000-0:3-1200-0:4-1000-0:5-0-0:6-1100-0:7-69-0:8-0-0:9-0-0:10-0-0:11-0-0:12-0-0:13-0-0:14-0-0:15-0-0:16-0-0:17-157-1:18-0-0:19-0-0:20-0-0:21-0-0&Queue=Your build queue is empty at this village.&quad=NW&duh=1 ");

    $(document).ready(function () {
        display(data);
    });
};
}());