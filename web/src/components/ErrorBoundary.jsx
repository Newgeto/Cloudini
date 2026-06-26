import { Component } from 'react'

import ErrorPage from './ErrorPage'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          type={500}
          onPrimary={this.props.onReset}
          onSecondary={() => window.location.reload()}
        />
      )
    }

    return this.props.children
  }
}
