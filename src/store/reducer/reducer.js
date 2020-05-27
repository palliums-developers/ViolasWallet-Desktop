let initState = {
    display: false
}

let ListReducer = (state = initState, action) => {
    let display = state.display;
    console.log(action.payload )
    switch (action.type) {
        case 'DISPLAY':
            return { display: action.payload };
        default:
            return state;
    }
};
export default ListReducer;