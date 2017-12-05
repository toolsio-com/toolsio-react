import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import map from 'lodash/map'
import sumBy from 'lodash/sumBy'
import classnames from 'classnames'
import { addFlashMessage } from '../../actions/flashMessages'
import { fetchInvoice, deleteInvoice } from '../../actions/invoiceActions'

// Localization 
import T from 'i18n-react'

import $ from 'jquery'

// Modal
$.fn.modal = require('semantic-ui-modal')
$.fn.dimmer = require('semantic-ui-dimmer')

class Show extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      _id: this.props.invoice ? this.props.invoice._id : null,
      sale: this.props.invoice ? this.props.invoice.sale : null,
      project: this.props.invoice ? this.props.invoice.project : null,
      customer: this.props.invoice ? this.props.invoice.customer : null,
      createdAt: this.props.invoice ? this.props.invoice.createdAt : '',
      deadline: this.props.invoice ? this.props.invoice.deadline : '',
      paymentTerm: this.props.invoice ? this.props.invoice.paymentTerm : '',
      interestInArrears: this.props.invoice ? this.props.invoice.interestInArrears : '',
      status: this.props.invoice ? this.props.invoice.status : '',
      referenceNumber: this.props.invoice ? this.props.invoice.referenceNumber : '',
      description: this.props.invoice ? this.props.invoice.description : ''
    }
  }

  componentDidMount = () => {
    // Fetch Invoice when id is present in params
    const { match } = this.props
    if (match.params.id) {
      this.props.fetchInvoice(match.params.id)
    } 
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.invoice) {
      this.setState({
        _id: nextProps.invoice._id,
        sale: nextProps.invoice.sale,
        project: nextProps.invoice.project,
        customer: nextProps.invoice.customer,
        createdAt: nextProps.invoice.createdAt,
        deadline: nextProps.invoice.deadline,
        dateOfAnInvoice: nextProps.invoice.dateOfAnInvoice,
        paymentTerm: nextProps.invoice.paymentTerm,
        interestInArrears: nextProps.invoice.interestInArrears,
        status: nextProps.invoice.status,
        referenceNumber: nextProps.invoice.referenceNumber,
        description: nextProps.invoice.description
      })
    }
  }

  showConfirmationModal(event) {
    event.preventDefault()

    // Show modal
    $('.small.modal.invoice').modal('show')
  }

  hideConfirmationModal(event) {
    event.preventDefault()

    // Show modal
    $('.small.modal.invoice').modal('hide')
  }

  handleDelete(id, event) {
    event.preventDefault()
    
    let name = this.state.name

    this.props.deleteInvoice(id).then(
      () => {
        this.props.addFlashMessage({
          type: 'success',
          text: T.translate("invoices.show.flash.success_delete", { name: name})
        })  
        this.context.router.history.push('/invoices')
      },
      ({ response }) => {
      }
    ) 
    
  }

  render() {
    const { _id, sale, project, customer, dateOfAnInvoice, deadline, paymentTerm, interestInArrears, status, referenceNumber, description, createdAt } = this.state

    const saleAndItems = (
      <div>
        <h3 className="ui header">{T.translate("invoices.show.sale")}</h3>
        <table className="ui very basic table invoice sale">
          <thead>
            <tr>
              <th>{T.translate("invoices.show.items.name")}</th>
              <th>{T.translate("invoices.show.items.unit")}</th>
              <th>{T.translate("invoices.show.items.quantity")}</th>
              <th>{T.translate("invoices.show.items.vat")}</th>              
              <th>{T.translate("invoices.show.items.price")}</th>
            </tr>
          </thead>
          <tbody>
            { sale && map(sale.items, (item) => 
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.unit}</td>
                <td>{item.quantity}</td>
                <td>{item.vat}</td>
                <td>{item.price}</td>
              </tr>
            )}
            <tr>
              <td colSpan="4"></td>
              <td><strong>{sale && sumBy(sale.items, 'price')}</strong></td>
            </tr>
          </tbody>  
        </table>
      </div>
    )

    const projectAndTasks = (
       <div>
        <h4 className="ui header">{T.translate("invoices.show.project")}</h4>
        <table className="ui very basic table invoice project">
          <thead>
            <tr>
              <th>{T.translate("invoices.show.tasks.name")}</th>
              <th>{T.translate("invoices.show.tasks.payment_type")}</th>
              <th>{T.translate("invoices.show.tasks.hours")}</th>
              <th>{T.translate("invoices.show.tasks.vat")}</th>
              <th>{T.translate("invoices.show.tasks.price")}</th>
            </tr>
          </thead>
          <tbody>
            { project && map(project.tasks, (task) => 
              <tr key={task._id}>
                <td>{task.name}</td>
                <td>{task.paymentType}</td>
                <td>{task.hours}</td>
                <td>{task.vat}</td>
                <td>{task.price}</td>
              </tr>
            )}
            <tr>
              <td colSpan="4"></td>
              <td><strong>{project && sumBy(project.tasks, 'price')}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    )

    return (
      <div className="ui stackable grid invoice show">
        <div className="twelve wide column">
          <div className="ui segment">    
            <h1 className="ui header">{T.translate("invoices.show.header")}
              <div className="sub header d-inline-block pl-1">{sale && sale.name || project && project.name}</div>
            </h1> 
            <div className={classnames("ui uppercase huge right corner label", {orange: status === 'pending', red: status === 'overdue', green: status === 'paid' })}> 
              <p>{status}</p>
            </div>
            <dl className="dl-horizontal">
              <dt>{T.translate("invoices.show.customer")}</dt>
              <dd>{customer && customer.name}</dd>
              {/*<dt>{T.translate("invoices.show.user")}</dt>
              <dd>{invoice.user.first_name}</dd>*/}            
              <dt>{T.translate("invoices.show.date_of_an_invoice")}</dt>
              <dd>{createdAt}</dd>
              <dt>{T.translate("invoices.show.deadline")}</dt>
              <dd>{deadline ? deadline : '-'}</dd>
              <dt>{T.translate("invoices.show.payment_term")}</dt>
              <dd>{paymentTerm ? paymentTerm : '-'}</dd>
              <dt>{T.translate("invoices.show.interest_in_arrears")}</dt>
              <dd>{interestInArrears ? interestInArrears : ''}</dd>
              <dt>{T.translate("invoices.show.reference_number")}</dt>
              <dd>{referenceNumber}</dd>
              <dt>{T.translate("invoices.show.description")}</dt>
              <dd>{description ? description : '-'}</dd>
            </dl>  

            { sale && saleAndItems }

            { project && projectAndTasks }

            <div className="ui divider"></div>

            <button className="ui negative button" onClick={this.showConfirmationModal.bind(this)}><i className="delete icon"></i>{T.translate("invoices.show.delete")}</button>
            <Link to={`/invoices/edit/${_id}`} className="ui primary button"><i className="edit icon"></i>{T.translate("invoices.show.edit")}</Link>
          </div>    
        </div>

        <div className="ui small modal invoice">
          <div className="header">Confirmation</div>
          <div className="content">
            <p className="red">{T.translate("invoices.show.confirmation_msg")}</p>
          </div>
          <div className="actions">
            <button className="ui button" onClick={this.hideConfirmationModal.bind(this)}>{T.translate("invoices.show.cancel")}</button>
            <button className="ui negative button" onClick={this.handleDelete.bind(this, _id)}>{T.translate("invoices.show.delete")}</button>
          </div>
        </div>
      </div>
    )
  }
}

Show.propTypes = {
  fetchInvoice: PropTypes.func.isRequired,
  deleteInvoice: PropTypes.func.isRequired,
  addFlashMessage: PropTypes.func.isRequired
}

Show.contextTypes = {
  router: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const { match } = props
  if (match.params.id) {
    return {
      invoice: state.invoices.find(item => item._id === match.params.id)
    }
  } 
}

export default connect(mapStateToProps, { fetchInvoice, deleteInvoice, addFlashMessage } )(Show)
