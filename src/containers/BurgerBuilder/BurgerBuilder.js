import React, { Component } from 'react';
import { connect } from 'react-redux';

import Aux from '../../hoc/Auxilliary/auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';
import * as actionTypes from '../../store/actions';



class BurgerBuilder extends Component {
    // constructor (props) {
    //     super(props);
    //     this.state = {}
    // }

    state = {
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        console.log(this.props)
        // axios.get("https://react-my-burger-f9992.firebaseio.com/ingredients.json")
        // .then(response => {
        //     this.setState( {ingredients: response.data } )
        // })
        // .catch(error => {
        //     this.setState( {error: true} )
        // });
    }

    updatePurchaseState (ingredients) {

        const sum = Object.keys(ingredients)
        .map(igKey=> {
            // console.log(ingredients[igKey]);
            return ingredients[igKey]
        })
        .reduce((sum, el) => {
            return sum + el;
        } ,0)
        // console.log(sum)
        this.setState({purchasable: sum > 0})
    }

    purchaseHandler = () => {
        // console.log(this);
        this.setState({purchasing: true});
    }


    purchaseCancelHander = () => {
        this.setState({purchasing: false});
    }

    purchaseContinueHander = () => {
        // alert('You Continue!');
        const queryParams = [];
        for(let i in this.state.ingredients) {
            queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]))
        }
        queryParams.push('price=' + this.state.totalPrice);
        const queryString = queryParams.join('&');
        this.props.history.push({
            pathname: 'checkout',
            search: '?' + queryString
        });
    }

    render(){
        const disableInfo = {
            ...this.props.ings
        };
        for (let key in disableInfo) {
            disableInfo[key] = disableInfo[key] <= 0
        }
        let orderSummary = null;

        let burger = this.state.error ? <p>Ingredients Cannot be Loaded!</p> : <Spinner />;
        if (this.props.ings) {
            burger = (
                <Aux>
                    <Burger ingredients={this.props.ings} />
                    <BuildControls
                    ingredientAdded={this.props.onIngredientAdded}
                    ingredientRemoved={this.props.onIngredientRemoved}
                    disabled={disableInfo}
                    purchasable={this.state.purchasable}
                    ordered={this.purchaseHandler}
                    price={this.state.totalPrice}
                    />
                </Aux>
            );
            orderSummary = <OrderSummary 
                ingredients={this.props.ings}
                price={this.state.totalPrice.toFixed(2)}
                purchaseCancelled={this.purchaseCancelHander}
                purchaseContinued={this.purchaseContinueHander}/>;

            
            if(this.state.loading) {
            orderSummary = <Spinner />
            }
        }

        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHander}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

const mapStateToProps = state => {
    return {
      ings: state.ingredients  
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch({type: actionTypes.ADD_INGREDIENT, ingredientName: ingName }),
        onIngredientRemoved: (ingName) => dispatch({type: actionTypes.REMOVE_INGREDIENT, ingredientName: ingName })
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));