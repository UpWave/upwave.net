import PropTypes from 'prop-types';
import React from 'react';

class TypeAhead extends React.Component {
  static propTypes = {
    sentence: PropTypes.string.isRequired,
    tag: PropTypes.string,
    startImmediately: PropTypes.bool,
    skipAnimation: PropTypes.bool,
    delayAfter: PropTypes.number,
    onFinish: PropTypes.func,
  };

  static defaultProps = {
    tag: 'span',
    startImmediately: true,
    skipAnimation: false,
    delayAfter: 0,
    onFinish: () => {},
  };

  static getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

  typeTimeout = -1;
  blinkInTimeout = -1;
  blinkOutTimeout = -1;

  state = {
    value: '',
    cursor: 0,
    isStarted: this.props.startImmediately,
    isCompleted: false,
    isBlinking: false,
  };

  get children() {
    const { children, skipAnimation, delayAfter } = this.props;
    const { isCompleted } = this.state;

    if (!children) return children;

    switch (typeof children) {
      case 'string':
        return children;
      case 'object':
        if (children instanceof Array) {
          // TODO: It won't work with multiple children on one level
          return children.map(child => React.cloneElement(child, {
            skipAnimation,
            delayAfter,
            startImmediately: isCompleted,
          }));
        } else {
          return React.cloneElement(children, {
            skipAnimation,
            delayAfter,
            startImmediately: isCompleted,
          });
        }
      default:
        return children;
    }
  }

  componentDidMount() {
    const { startImmediately, skipAnimation } = this.props;

    if (!skipAnimation && startImmediately) this.startTyping();
  }

  componentWillReceiveProps(nextProps) {
    const { cursor, isStarted } = this.state;

    if (nextProps.startImmediately && !cursor && !isStarted) {
      this.setState({
        isStarted: true,
      }, this.startTyping);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.typeTimeout);
    clearTimeout(this.blinkInTimeout);
    clearTimeout(this.blinkOutTimeout);
  }

  startTyping = () => {
    this.typeTimeout = setTimeout(this.type, TypeAhead.getRandomValue(75, 150));
  }

  startBlinking = () => {
    const { delayAfter, onFinish } = this.props;
    this.blinkInTimeout = setTimeout(this.blinkIn, 0);

    if (delayAfter) {
      setTimeout(() => {
        clearTimeout(this.blinkInTimeout);
        clearTimeout(this.blinkOutTimeout);

        if (this.blinkInTimeout > this.blinkOutTimeout) {
          this.setState({
            value: this.state.value.slice(0, -1),
          });

          onFinish();
        }
      }, delayAfter);
    }
  }

  type = () => {
    const { value, cursor } = this.state;
    const { sentence } = this.props;

    if (cursor >= sentence.length) {
      this.setState({
        isCompleted: true,
      });

      if (!this.children) {
        this.setState({
          startBlinking: true,
        }, this.startBlinking);
      } else {
        this.setState({
          value: value.slice(0, -1),
        });
      }

      return;
    }

    const nextCharacter = this.props.sentence[cursor];

    this.setState({
      value: value.slice(0, -1) + nextCharacter + '|',
      cursor: cursor + 1,
    }, this.startTyping);
  }

  blinkIn = () => {
    this.setState({
      value: this.state.value.slice(0, -1),
    }, () => this.blinkOutTimeout = setTimeout(this.blinkOut, 600));
  }

  blinkOut = () => {
    this.setState({
      value: this.state.value + '|',
    }, () => this.blinkInTimeout = setTimeout(this.blinkIn, 600));
  }

  render() {
    const Tag = this.props.tag;
    const { skipAnimation } = this.props;

    return (
      <Tag>
        {skipAnimation ? this.props.sentence : this.state.value}
        {this.children}
      </Tag>
    );
  }
}

export default TypeAhead;
