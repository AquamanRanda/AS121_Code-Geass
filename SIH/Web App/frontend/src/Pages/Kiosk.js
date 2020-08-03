import React, { Component } from 'react';
import StarRatingComponent from 'react-star-rating-component';

export class Kiosk extends Component {
    state = {
        rating1: 1,
        rating2: 1,
        rating3: 1,
        rating4: 1,
        rating5: 1
      };

    onStarClick1(nextValue, prevValue, name) {
        this.setState({rating1: nextValue});
      }
      onStarClick2(nextValue, prevValue, name) {
        this.setState({rating2: nextValue});
      }
      onStarClick3(nextValue, prevValue, name) {
        this.setState({rating3: nextValue});
      }
      onStarClick4(nextValue, prevValue, name) {
        this.setState({rating4: nextValue});
      }
      onStarClick5(nextValue, prevValue, name) {
        this.setState({rating5: nextValue});
      }

      OnSubmitHandler = async () => {
          let avg = 0;
          let sum = this.state.rating1 + this.state.rating2 + this.state.rating3 + this.state.rating4 + this.state.rating5;
          avg = sum/5;
          let response = await fetch("https://asia-east2-eudaemon-20a5e.cloudfunctions.net/api/kiosk",{method:'POST',headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },body :JSON.stringify({rating:avg,cci:"chennai-cci1"}) })
      }


    render() {
        const { rating1 , rating2 ,rating3 , rating4 ,rating5 } = this.state;
        return (
            <div className="pt-32 text-center text-4xl">
            <h2>how is food? : {rating1}</h2>
            <StarRatingComponent 
              name="rate1" 
              starCount={5}
              value={rating1}
              onStarClick={this.onStarClick1.bind(this)}
            />
            <h2>How are the Care Takers: {rating2}</h2>
            <StarRatingComponent 
              name="rate2" 
              starCount={5}
              value={rating2}
              onStarClick={this.onStarClick2.bind(this)}
            />
            <h2>How Happy are you ?:  {rating3}</h2>
            <StarRatingComponent 
              name="rate3" 
              starCount={5}
              value={rating3}
              onStarClick={this.onStarClick3.bind(this)}
            />
            <h2>How is the school?:  {rating4}</h2>
            <StarRatingComponent 
              name="rate4" 
              starCount={5}
              value={rating4}
              onStarClick={this.onStarClick4.bind(this)}
            />
            <h2>How is Clean is the place? : {rating5}</h2>
            <StarRatingComponent 
              name="rate5" 
              starCount={5}
              value={rating5}
              onStarClick={this.onStarClick5.bind(this)}
            />
            <div>
         <button className=" text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg" onClick={this.OnSubmitHandler}>
                Submit
            </button>
          </div></div>
        )
    }
}

export default Kiosk
