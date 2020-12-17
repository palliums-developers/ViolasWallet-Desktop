import React,{Component} from "react";
import './mining.scss'
import { rndNum } from "../../utils/redomNum";
import { callHandler, registerHandler } from "../../utils/jsbridge";
import intl from "react-intl-universal";
let url1 = "https://api4.violas.io";

//挖矿奖励
class MiningAwards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      total_incentive: 0,
      bank_incentive: 0,
      pool_incentive: 0,
      bank_total_incentive: 0,
      pool_total_incentive: 0,
      ranking: [],
      is_new: 0,
      ifMobile: false,
      lang:'EN'
    };
  }
  componentWillMount() {
    this.setState(
      {
        id: rndNum(100)
      });
    if (this.props.location) {
      if (this.props.location.search) {
        this.setState({
          ifMobile: true,
          lang:this.props.location.search.split("&")[1].split("=")[1].toUpperCase()
        },()=>{
          intl.options.currentLocale = this.state.lang
        });
      }
    }
  }
  componentDidMount() {
    this.getMiningInfo();
    this.getVerifiedWallet();
  }
  //显示VLS地址（前6...后6）
  showVLSAddress(str) {
    // 中间显示省略号，截取显示括号内容
    // var str = "53e59e4b4fa3c35770846f6c87ca2d35";
    var last = 0;
    var all = str.length;
    var first = str.substr(0, 6);
    str = first + " ... " + str.substr(all - 6, 6);
    return str;
  }
  //获取挖矿奖励信息
  getMiningInfo() {
    fetch(
      url1 +
        "/violas/1.0/incentive/mint/info?address=" +
        window.sessionStorage.getItem("violas_address")
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          this.setState({
            total_incentive: res.data.total_incentive,
            bank_incentive: res.data.bank_incentive,
            pool_incentive: res.data.pool_incentive,
            bank_total_incentive: res.data.bank_total_incentive,
            pool_total_incentive: res.data.pool_total_incentive,
            ranking: res.data.ranking,
          });
        }
      });
  }
  //钱包是否已验证
  getVerifiedWallet() {
    fetch(
      url1 +
        "/violas/1.0/incentive/check/verified?address=" +
        window.sessionStorage.getItem("violas_address")
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          this.setState({
            is_new: res.data.is_new,
          });
          console.log(res.data);
        }
      });
  }
  //H5挖矿明细
  miningdetail = () => {
    callHandler(
      "callJavaScript",
      JSON.stringify({
        id: this.state.id,
        method: "yield_farming_detail",
        params: [],
      }),
      (resp) => {
        console.log(resp);
        if (JSON.parse(resp).result === "success") {
        }
      }
    );
  };
  render() {
    let {
      total_incentive,
      bank_incentive,
      pool_incentive,
      bank_total_incentive,
      pool_total_incentive,
      ranking,
      is_new,
      ifMobile,
    } = this.state;
    return (
      <div className={ifMobile == false ? "miningAwards" : "miningAwards1"}>
        <div className="miningFundList">
          <div className="goRule">
            <img src="/img/m_矩形 4@2x.png" />
            <p
              onClick={() => {
                this.props.history.push("/homepage/home/ruleDescription");
              }}
            >
              规则说明
              <img src="/img/m_编组 41@2x.png" />
            </p>
          </div>

          <div className="fundList">
            <h4>总收益 ( VLS )</h4>
            <span>{total_incentive}</span>
            <div className="rightImg">
              {ifMobile == false ? (
                <img src="/img/m_编组 15@2x.png" />
              ) : (
                <img src="/img/mobile_m_编组 21@3x.png" />
              )}
            </div>
            <p
              onClick={
                ifMobile == false
                  ? () => {
                      this.props.history.push("/homepage/home/miningDetails");
                    }
                  : this.miningdetail()
              }
            >
              挖矿明细
              <img src="/img/m_编组 18@2x.png" />
            </p>
          </div>
          <div className="poolingFund">
            <div>
              <div className="poolingFundContent">
                <p>资金池挖矿已提取：{pool_total_incentive} VLS</p>
                <p>
                  <span>
                    <label>待提取(VLS)</label>
                    {pool_incentive}
                  </span>
                  <button>一键提取</button>
                </p>
              </div>
              <div className="line"></div>
              <div className="poolingFundContent">
                <p>数字银行挖矿已提取：{bank_total_incentive} VLS</p>
                <p>
                  <span>
                    <label>待提取(VLS)</label>
                    {bank_incentive}
                  </span>
                  <button>一键提取</button>
                </p>
                <p>
                  <img src="/img/m_wenhao 3@2x.png" />
                  当前待提取数值为查询时结果，可能与最终交易时存在误差！提取结果将以最终交易时为准。
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="getMoreVLS">
          <div>
            <h3>获取更多VLS</h3>
            <div className="line"></div>
            <div className="getMoreContent">
              <div>
                <p>
                  <label>新用户验证</label>
                  {is_new == 0 ? (
                    <button
                      className="btn"
                      onClick={() => {
                        this.props.history.push("/homepage/home/userRewards");
                      }}
                    >
                      去验证
                    </button>
                  ) : (
                    <button className="btn btn1">已验证</button>
                  )}
                </p>
                <p>
                  <label>存款挖矿</label>
                  <button
                    className="btn"
                    onClick={() => {
                      this.props.history.push(
                        "/homepage/home/digitalBank/saveDetails"
                      );
                    }}
                  >
                    去存款
                  </button>
                </p>
                <p>
                  <label>资金池挖矿</label>
                  <button className="btn">去转入</button>
                </p>
              </div>
              <div>
                <p>
                  <label>邀请好友</label>
                  <button
                    className="btn"
                    onClick={() => {
                      this.props.history.push("/homepage/home/inviteRewards");
                    }}
                  >
                    去邀请
                  </button>
                </p>
                <p>
                  <label>借款挖矿</label>
                  <button
                    className="btn"
                    onClick={() => {
                      this.props.history.push(
                        "/homepage/home/digitalBank/borrowDetails"
                      );
                    }}
                  >
                    去借款
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rankingList">
          <div>
            <div className="head">
              <h3>排行榜</h3>

              <p
                onClick={() => {
                  this.props.history.push("/homepage/home/rankingList");
                }}
              >
                <label>查看更多</label>
                <img src="/img/m_编组 17@2x.png" />
              </p>
            </div>
            <div className="line"></div>
            <div className="list">
              {ranking.map((v, i) => {
                return (
                  <p key={i}>
                    <span>
                      {v.rank == 1 ? (
                        <img src="/img/m_编组 56备份 3@2x.png" />
                      ) : v.rank == 2 ? (
                        <img src="/img/m_编组 5备份 2@2x.png" />
                      ) : v.rank == 3 ? (
                        <img src="/img/m_编组 4备份 2@2x.png" />
                      ) : null}

                      {this.showVLSAddress(v.address)}
                    </span>
                    <span>{v.incentive} VLS</span>
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
 
export default MiningAwards;