import React, { Component } from 'react'
import Hello from './components/Hello'

export default class Test1 extends Component {
  render() {
    return (
      <div>
        <Hello name='world'/>

        <div>content</div>
      </div>
    )
  }
}