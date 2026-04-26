import { NavBar, DatePicker } from 'antd-mobile'
import './index.scss'
import {useEffect, useMemo, useState} from "react";
import classNames from "classnames";
import dayjs from "dayjs";
import {useSelector} from "react-redux";
import _ from 'lodash'
import DailyBill from "@/pages/Month/components/DayBill";
const Month = () => {
    //按月做数据分组 先拿到所有数据
    const billList = useSelector(state=> state.bill.billList)
    const monthGroup = useMemo(() => {
        //return出去计算后的按月分类的数据
        return _.groupBy(billList, (item) => dayjs(item.date).format('YYYY-MM'))
    },[billList])
    //这里monthGroup key是时间，value是数组里的数据
    console.log(monthGroup)
    //控制时间选择弹框的打开与关闭
    const [dateVisible, setDateVisible] = useState(false)
    //控制时间显示
    const [currentDate, setCurrentDate] = useState(()=>{
        return dayjs(new Date()).format('YYYY-MM')
    })
    const [currentMonthList, setCurrentMonthList] = useState([])
    const monthResult = useMemo(() => {
        const pay = currentMonthList.filter(item => item.type === 'pay').reduce((a, c) => a + c.money, 0)
        const income = currentMonthList.filter(item => item.type === 'income').reduce((a, c) => a + c.money, 0)
        return {
            pay,
            income,
            total: pay + income
        }
    }, [currentMonthList]);
    //初始化的时候把当前月的统计数据显示出来
    useEffect(() => {
        const nowDate =dayjs().format('YYYY-MM')
        if(monthGroup[nowDate]){
            setCurrentMonthList(monthGroup[nowDate])
        }
    }, [monthGroup]);
    const onConfirm = (date) => {
        setDateVisible(false)
        const formatDate = dayjs( date).format('YYYY-MM')
        setCurrentMonthList(monthGroup[formatDate] || [])
        setCurrentDate(formatDate)
    }
    //当前月再按照日分组
    const dayGroup = useMemo(() => {
        const groupData =  _.groupBy(currentMonthList, (item) => dayjs(item.date).format('YYYY-MM-DD'))
        const keys = Object.keys(groupData)
        return {
            groupData,
            keys
        }
    }, [currentMonthList])

    return (
        <div className="monthlyBill">
            <NavBar className="nav" backArrow={false}>
                月度收支
            </NavBar>
            <div className="content">
                <div className="header">
                    {/* 时间切换区域 */}
                    <div className="date" onClick={() => setDateVisible(true)}>
            <span className="text">
             {currentDate + ''}月账单
            </span>
                        {/*根据当前弹框打开状态控制expand类名是否有*/}
                        <span className={classNames('arrow', dateVisible && 'expand')}></span>
                    </div>
                    {/* 统计区域 */}
                    <div className='twoLineOverview'>
                        <div className="item">
                            <span className="money">{monthResult.pay.toFixed(2)}</span>
                            <span className="type">支出</span>
                        </div>
                        <div className="item">
                            <span className="money">{monthResult.income.toFixed(2)}</span>
                            <span className="type">收入</span>
                        </div>
                        <div className="item">
                            <span className="money">{monthResult.total.toFixed(2)}</span>
                            <span className="type">结余</span>
                        </div>
                    </div>
                    {/* 时间选择器 */}
                    <DatePicker
                        className="kaDate"
                        title="记账日期"
                        precision="month"
                        visible={dateVisible}
                        onCancel={()=> setDateVisible(false)}
                        onConfirm={onConfirm}
                        //点击蒙层区域关闭时间选择器
                        onClose={()=> setDateVisible(false)}
                        max={new Date()}
                    />
                </div>
                {/*单日列表统计*/}
                {
                    dayGroup.keys.map(key=>{
                        return <DailyBill key = {key} date = {key} billList = {dayGroup.groupData[key]}/>
                    })
                }

            </div>
        </div >
    )
}

export default Month