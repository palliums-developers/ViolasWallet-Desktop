import { getTyArgs, fullWith16, getTimestamp } from './trans';
import code_data from './code.json';

let getBTCTx = (_from, _to, _amount, _script) => {
    let tx = {
        from: _from,
        amount: _amount,
        changeAddress: _from,
        payeeAddress: _to,
        script: _script
    }
    return tx;
}

export default getBTCTx