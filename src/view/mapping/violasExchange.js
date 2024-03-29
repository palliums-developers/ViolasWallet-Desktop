import React, { Component } from "react";
import "./mapping.scss";
import WalletConnect from "../../packages/browser/src/index";
import { connect } from "react-redux";
import WalletconnectDialog from "../components/walletconnectDialog";
//import { BigNumber } from "bignumber.js";
import { Form, Select, Input } from "antd";
//violas兑换
class ViolasExchange extends Component {
  constructor() {
    super();
    this.state = {
      bridge: "https://walletconnect.violas.io",
      walletConnector: {},
      connected: false,
      tokenBalance: 0,
      coinName: "",
      token: [
        {
          name: "VLSTUSDT",
          address: "0xFFf6458a07bCb69df2EaEbbf9Cf463aB08F3f39B",
        },
      ],
      // swapContractAddress: "0xE6C7f2DAB2E9B16ab124E45dE3516196457A1120",
      // tokenContractAddress: "0x6f08730dA8e7de49a4064d2217c6B68d7E61E727",
      tokenContractAddress: "0xFFf6458a07bCb69df2EaEbbf9Cf463aB08F3f39B",
      swapContractAddress: "0xCb9b6D30E26d17Ce94A30Dd225dC336fC4536FE8",
      swapAmount: "",
    };
    this.eth = null;
  }
  async componentWillMount() {
    await this.getNewWalletConnect();
  }
  async getNewWalletConnect() {
    await this.setState({
      walletConnector: new WalletConnect({ bridge: this.state.bridge }),
    });
  }
  //   stopPropagation(e) {
  //     e.nativeEvent.stopImmediatePropagation();
  //   }
  componentDidMount() {
    // console.log(this.props.eth);
    this.setState({
      coinName: this.state.token[0].name,
    });
    if (this.props.eth == null) {
      this.connectWallet();
    } else {
      this.eth = this.props.eth;
      this.setState({
        connected: true,
        account: this.eth.defaultAccount,
      },()=>{
        this.queryTokenBalance();
      });
    }
  }
  // 连接 ETH 钱包
  connectWallet = () => {
    
    window.ethereum.enable().then(() => {
      this.eth = window.web3.eth;
      
      this.setState({
        connected: true,
        account: this.eth.defaultAccount,
      },()=>{
        this.queryTokenBalance();
      });
      console.log("connect success.");
    });
    this.setState({
      connected: false,
    });
    console.log("The link was clicked.");
  };
  // 授权合约，花费一定费用的权限
  approveContract = () => {
    if (!(this.eth && this.eth.abi)) {
      alert("请先连接 ETH 钱包");
      this.connectWallet();
    } else {
      let swapContractAddress = this.state.swapContractAddress;
      let tokenContractAddress = this.state.tokenContractAddress;

      let amount = Number(this.state.swapAmount) * 1e6;
      let functionCallAbi = this.eth.abi.encodeFunctionCall(
        {
          name: "approve",
          type: "function",
          inputs: [
            {
              type: "address",
              name: "_spender",
            },
            {
              type: "uint256",
              name: "_value",
            },
          ],
        },
        [swapContractAddress, amount]
      );
      // console.log(functionCallAbi, "..functionCallAbi1");
      // 调用代币合约，授权兑换合约可以花费 amount 数量的资产。
      let account = this.state.account;
      this.eth
        .sendTransaction({
          from: account,
          to: tokenContractAddress,
          value: "0",
          gas: 50000,
          data: functionCallAbi,
        })
        .on("transactionHash", (hash) => {
          console.log("Transaction approve: " + hash);
          if (amount != 0) {
            this.startSwap();
          }
        })
        .on("error", console.error);
    }
  };

  // 发起兑换逻辑
  startSwap = () => {
    if (!(this.eth && this.eth.abi)) {
      alert("请先连接 ETH 钱包");
    } else {
      let swapContractAddress = this.state.swapContractAddress;
      let tokenContractAddress = this.state.tokenContractAddress;

      let functionCallAbi = this.eth.abi.encodeFunctionCall(
        {
          name: "transferProof",
          type: "function",
          inputs: [
            {
              type: "address",
              name: "tokenAddr",
            },
            {
              type: "string",
              name: "datas",
            },
          ],
        },
        [tokenContractAddress, "here is mapping datas"]
      );

      let account = this.state.account;
      // console.log(functionCallAbi, "..functionCallAbi2");
      // Gas 费预估例子
      // 文档 https://learnblockchain.cn/docs/web3.js/web3-eth.html#estimategas
      // this.eth
      //   .estimateGas({
      //     from: account,
      //     to: swapContractAddress,
      //     value: "0",
      //     data: functionCallAbi,
      //   })
      //   .then((gasLimit) => {
      //     console.log("Transaction GasLimit: " + gasLimit);
      //   });

      // 调用兑换合约，发起兑换
      // 文档 https://learnblockchain.cn/docs/web3.js/web3-eth.html#sendtransaction
      this.eth
        .sendTransaction({
          from: account,
          to: swapContractAddress,
          value: "0",
          gas: 300000,
          data: functionCallAbi,
        })
        .on("transactionHash", function (hash) {
          console.log("Transaction: " + hash);
        });
    }
  };
  // 查询 ERC20 代币价格
  // 此为 balanceOf 方法调用例子
  queryTokenBalance = () => {
    if (!(this.eth && this.eth.abi)) {
      alert("请先连接 ETH 钱包");
    } else {
      console.log()
      let tokenContractAddress = this.state.tokenContractAddress;
      let account = this.state.account;

      // 查询合约的余额方法，ERC20 方法参照文档 https://eips.ethereum.org/EIPS/eip-20erc20
      // function balanceOf(address _owner) public view returns (uint256 balance)
      // 1. 先调用 encodeFunctionCall 方法序列化参数
      // 2. 调用 call 函数在 ETH 链上查询
      // 3. 使用 decodeParameters 方法对返回结果进行反序列化
      let functionCallAbi = this.eth.abi.encodeFunctionCall(
        {
          name: "balanceOf",
          type: "function",
          inputs: [
            {
              type: "address",
              name: "_owner",
            },
          ],
        },
        [account]
      );

      // 调用兑换合约，发起兑换
      // ETH 合于调用
      // 文档 https://learnblockchain.cn/docs/web3.js/web3-eth.html#call
      this.eth
        .call({
          to: tokenContractAddress,
          data: functionCallAbi,
        })
        .then((resultAbi) => {
          let result = this.eth.abi.decodeParameters(["uint256"], resultAbi);
          // console.log(result[0]);
          this.setState({
            tokenBalance: result[0] / 1e6,
          });
        });
    }
  };
  //输入数量
  onChangeSwapAmount = (e) => {
    // console.log(e.target.value)
    this.setState({
      swapAmount: e.target.value,
    });
  };
  //选择地址
  onChangeSwapContractAddress = (value) => {
    this.setState({
      swapContractAddress: value,
    });
  };
  //兑换
  confirmExchange = () => {
    if (this.state.connected) {
      this.approveContract();
    } else {
      this.connectWallet();
    }
  };
  //获取兑换地址
  onChangeTokenContractAddress = (value) => {
    console.log(value);
    for (let i = 0; i < this.state.token.length; i++) {
      if (value == this.state.token[i].address) {
        this.setState({
          coinName: this.state.token[i].name,
        });
      }
    }
    this.setState({
      tokenContractAddress: value,
    });
  };
  render() {
    let { tokenBalance, token, coinName, swapAmount } = this.state;
    // console.log(balance,'...........');
    return (
      <div className="violasExchange">
        <div className="violasExchangeContent">
          <h3>兑换</h3>
          <div className="formWrap">
            <div className="form">
              <div>
                <p>选择地址</p>
                <Form.Item label="">
                  <Select
                    value="0xCb9b6D30E26d17Ce94A30Dd225dC336fC4536FE8"
                    // value={this.state.swapContractAddress}
                    onChange={this.onChangeSwapContractAddress}
                  >
                    <Select.Option>
                      0xCb9b6D30E26d17Ce94A30Dd225dC336fC4536FE8
                    </Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div>
                <p>
                  <label>币种</label>
                  <span>余额: {tokenBalance}</span>
                </p>
                <Form.Item label="">
                  <Select
                    value={coinName}
                    onChange={this.onChangeTokenContractAddress}
                  >
                    {token.map((v, i) => {
                      return (
                        <Select.Option value={v.address}>
                          {v.name}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </div>
              <div>
                <p>兑换数量</p>
                <Input
                  prefix=""
                  suffix="RMB"
                  placeholder="请输入代币兑换数量"
                  type="number"
                  value={swapAmount}
                  onChange={this.onChangeSwapAmount}
                />
                <span className="scale">兑换比例：1:1</span>
              </div>
            </div>
            <div className="confirmBtn" onClick={() => this.confirmExchange()}>
              兑 换
            </div>
          </div>
          <div className="descrList">
            <div>
              <h4>基本流程：</h4>
              <p>验证地址 — 币种兑换 — 授权合约 — 发起兑换 — 兑换成功</p>
            </div>
            <div>
              <h4>如何查询交易状态？</h4>
              <p>可在本钱包交易记录查询交易状态</p>
            </div>
            <div>
              <h4>如何查询交易状态？</h4>
              <p>
                可能因为您在进行当前钱包的当前币种映射流程时，只授权了合约，并没有完成兑换流程
              </p>
              <span>解决方案</span>
              <p>
                您可以选择交易失败的钱包地址和币种，在兑换数量的输入框输入0，点击兑换，完成授权合约和发起兑换全流程即可
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
let mapStateToProps = (state) => {
  return state.ListReducer;
};
let mapDispatchToProps = (dispatch) => {
  return {
    showPolling: (type) => {
      dispatch({
        type: "DISPLAY",
        payload: type,
      });
    },
  };
};
export default connect(mapStateToProps)(ViolasExchange);
// Transaction approve: 0x0834ea17b405fb72a79e809bec909af48e51dd0677af65fc20b1a093961665aa
// 0x302ed23f0000000000000000000000006f08730da8e7de49a4064d2217c6b68d7e61e7270000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001568657265206973206d617070696e672064617461730000000000000000000000 ..functionCallAbi
// Transaction: 0x99ea128cfd2e6b9c555376f6d01d2aef5e33a735e803f36489428b989708dd57
// {
//   "blockHash": "0x174dbc9b75d24a8d6d775d29b20ef072ce69382d8992688bf6d726e20db18d23",
//   "blockNumber": 22369378,
//   "contractAddress": null,
//   "cumulativeGasUsed": 520078,
//   "from": "0xfb5ee5e027a421a8aa6645856a1838cca5c61b34",
//   "gasUsed": 299839,
//   "logs": [],
//   "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
//   "status": false,
//   "to": "0xe6c7f2dab2e9b16ab124e45de3516196457a1120",
//   "transactionHash": "0x99ea128cfd2e6b9c555376f6d01d2aef5e33a735e803f36489428b989708dd57",
//   "transactionIndex": 3
// }
