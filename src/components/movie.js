import React, { Component }  from 'react';
import {connect} from "react-redux";
import {
    Glyphicon,
    Panel,
    ListGroup,
    ListGroupItem,
    Form,
    FormGroup,
    Col,
    ControlLabel,
    FormControl, Button
} from 'react-bootstrap'
import { Image } from 'react-bootstrap'
import { withRouter } from "react-router-dom";
import {fetchMovie} from "../actions/movieActions";
import {addReview} from "../actions/movieActions";

//support routing by creating a new component

class Movie extends Component {
    constructor(props) {
        super(props);
        this.updateDetails = this.updateDetails.bind(this);

        this.state = {
            details:{
                title: '',
                rating: '',
                review: ''
            }
        };
    }

    submitReview() {

        this.state.details.title = this.props.selectedMovie.title;

        const {dispatch} = this.props;
        dispatch(addReview(this.state));
    }

    componentDidMount() {
        const {dispatch} = this.props;

        if (this.props.selectedMovie == null)
            dispatch(fetchMovie(this.props.movieId));
    }

    updateDetails(event){
        let updateDetails = Object.assign({}, this.state.details);

        updateDetails[event.target.id] = event.target.value;
        this.setState({
            details: updateDetails
        });
    }

    render() {
        const ActorInfo = ({actors}) => {
            return actors.map((actor, i) =>
                <p key={i}>
                    <b>{actor[0]}</b> {actor[1]}
                </p>
            );
        };

        const ReviewInfo = ({reviews}) => {
            return reviews.map((review, i) =>
                <p key={i}>
                <b>{review.username}</b> {review.review}
                    <Glyphicon glyph={'star'} /> {review.rating}
                </p>
            );
        }

        const DetailInfo = ({currentMovie}) => {
            if (!currentMovie) { // evaluates to true if currentMovie is null
                return <div>Loading...</div>;
            }

            return (
                <Panel>
                    <Panel.Heading>Movie Detail</Panel.Heading>
                    <Panel.Body><Image className="image" src={currentMovie.imageUrl} thumbnail /></Panel.Body>
                    <ListGroup>
                        <ListGroupItem>{currentMovie.title}</ListGroupItem>
                        <ListGroupItem><ActorInfo actors={currentMovie.actors} /></ListGroupItem>
                        <ListGroupItem><h4><Glyphicon glyph={'star'} /> {currentMovie.avgRating} </h4></ListGroupItem>
                    </ListGroup>
                    <Panel.Body><ReviewInfo reviews={currentMovie.reviews} /></Panel.Body>
                    <Panel.Body>
                        <Form horizontal>
                            <FormGroup controlId="username">
                                <Col componentClass={ControlLabel} sm={2}>
                                    Rating
                                </Col>
                                <Col sm={10}>
                                    <FormControl onChange={this.updateDetails} value={this.state.details.rating} type="number" placeholder="" />
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="password">
                                <Col componentClass={ControlLabel} sm={2}>
                                    Review
                                </Col>
                                <Col sm={10}>
                                    <FormControl onChange={this.updateDetails} value={this.state.details.review} type="text" placeholder="" />
                                </Col>
                            </FormGroup>

                            <FormGroup>
                                <Col smOffset={2} sm={10}>
                                    <Button onChange={this.submitReview}>Submit Review</Button>
                                </Col>
                            </FormGroup>
                        </Form>
                    </Panel.Body>

                </Panel>
            );
        };
        return (
            <DetailInfo currentMovie={this.props.selectedMovie} />
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    console.log(ownProps);
    return {
        selectedMovie: state.movie.selectedMovie,
        movieId: ownProps.match.params.movieId
    }
};


export default withRouter(connect(mapStateToProps)(Movie));