import React, { Component } from 'react' 
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import map from 'lodash/map'
import { Validation } from '../../utils'
import { InputField, TextAreaField, SelectField } from '../../utils/FormFields'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

// Datepicker 
import DatePicker from 'react-datepicker'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'

// Localization 
import T from 'i18n-react'

import $ from 'jquery'
$.fn.progress = require('semantic-ui-progress')

import Breadcrumb from '../Layouts/Breadcrumb'

class Form extends Component {
  constructor(props) {
    super(props)
    this.state = {
      id: this.props.project ? this.props.project.id : null,
      name: this.props.project ? this.props.project.name : '',
      deadline: this.props.project ? moment(this.props.project.deadline).format("MM-DD-YYYY") : moment(),
      customerId: this.props.project ? this.props.project.customerId : '',
      status: this.props.project ? this.props.project.status : 'new',
      progress: this.props.project ? this.props.project.progress : 0,
      description: this.props.project ? this.props.project.description : '',
      total: this.props.project ? this.props.project.total : 0,
      errors: {},
      isLoading: false
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.project) {
      this.setState({
        id: nextProps.project.id,
        name: nextProps.project.name,
        deadline: moment(nextProps.project.deadline),
        customerId: nextProps.project.customerId,
        status: nextProps.project.status,
        progress: nextProps.project.progress,
        description: nextProps.project.description,
        total: nextProps.project.total
      })
    }
  }

  handleChange = (e) => {
    //this.state.project['name'] = event.target.value // WRONG! Never mutate a state in React

    if (!!this.state.errors[e.target.name]) {
      // Clone errors form state to local variable
      let errors = Object.assign({}, this.state.errors)
      delete errors[e.target.name]

      this.setState({
        [e.target.name]: e.target.value,
        errors
      })
    } else {
      this.setState({
        [e.target.name]: e.target.value
      })
    }
  }

  isValid() {
    const { errors, isValid } = Validation.validateProjectInput(this.state)

    let updatedErrors = Object.assign({}, this.state.errors)
    updatedErrors.message.errors = errors

    if (!isValid) {
      this.setState({ errors: updatedErrors })
    }

    return isValid
  }

  handleSubmit = async (event) => {
     event.preventDefault()

    // Validation
    if (true) { 
      this.setState({ isLoading: true })

      const { name, deadline, status, progress, description, total, customerId } = this.state
      
      this.props.createProjectMutation({ variables: { name, deadline, status, progress, description, total, customerId: parseInt(customerId) }})
        .then(res => {
          // this.props.addFlashMessage({
          //   type: 'success',
          //   text: T.translate("projects.form.flash.success_update", { name: name})
          // })  
          // this.context.router.history.push('/projects')
          

          const { success, project, errors } = res.data.createProject

          if (success) {
            this.context.router.history.push('/projects')
          } else {
            let errorsList = {}
            errors.map(error => errorsList[error.path] = error.message)

            this.setState({ errors: errorsList, isLoading: false })
          }
        })
        .catch(err => this.setState({ errors: err, isLoading: false }))
    }    
  }

  handleChangeDate(deadline) {
    if (!!this.state.errors['deadline']) {
      // Clone errors form state to local variable
      let errors = Object.assign({}, this.state.errors)
      delete errors['deadline']
      
      this.setState({
        deadline: deadline,
        errors
      })
    } else {
      this.setState({
        deadline: deadline
      })
    }
  } 

  handleIncreaseProgress = (event) => {
    event.preventDefault()

    const { id, progress } = this.state

    if (progress <= 90) {
      this.setState({
        progress: progress+10
      })

      $("#progress").progress({
        percent: progress,
        label: 'percent',
        text: {
          percent : `${progress+10}%`
        },
        className : {
          active: 'success'
        }
      })
    }
  }

  handleDecreaseProgress = (event) => {
    event.preventDefault()

    const { id, progress } = this.state

    if (progress >= 10) {
      this.setState({
        progress: progress-10
      })

      $("#progress").progress({
        percent: progress,
        label: 'percent',
        text: {
          percent : `${progress-10}%`
        },
        className : {
          active: 'success'
        }
      })
    }
  }

  render() {
    const { id, name, deadline, customerId, status, progress, description, errors, isLoading } = this.state
    
    const { getCustomers } = this.props.getCustomersQuery
  
    const customersOptions = map(getCustomers, (customer) => 
      <option key={customer.id} value={customer.id}>{customer.name}</option>
    )
    
    return (
      <div className="ui stackable grid">

        <Breadcrumb />

        <div className="ui text container ui segment">  

          <form className={classnames("ui form", { loading: isLoading })} onSubmit={this.handleSubmit.bind(this)}>
            <div className="inline field"> 
              {id ? <h1 className="ui header">{T.translate("projects.form.edit_project")}</h1> : <h1 className="ui header">{T.translate("projects.form.new_project")}</h1>}
            </div>
            
            { !!errors.message && <div className="ui negative message"><p>{errors.message}</p></div> } 

            <InputField
              label={T.translate("projects.form.name")}
              name="name" 
              value={name} 
              onChange={this.handleChange.bind(this)} 
              placeholder="Name"
              error={errors.name}
              formClass="inline field"
            />
                          
            <div  className={classnames("inline field", { error: !!errors.deadline })}>
              <label className="" htmlFor="date">{T.translate("projects.form.deadline")}</label>
              <DatePicker
                dateFormat="DD/MM/YYYY"
                selected={deadline}
                onChange={this.handleChangeDate.bind(this)}
              />
              <span className="red">{errors.deadline}</span>
            </div>
            
            <SelectField
              label={T.translate("projects.form.customer")}
              name="customerId"
              value={customerId && customerId} 
              onChange={this.handleChange.bind(this)} 
              error={errors.customerId}
              formClass="inline field"

              options={[<option key="default" value="" disabled>{T.translate("projects.form.select_customer")}</option>,
                customersOptions]}
            />
            
            {
              customersOptions.length === 0 &&
                <div className="inline field">
                  <div className="ui mini info message mb-1">
                    <p>{T.translate("projects.form.empty_customers_message")}</p>

                    <Link className="ui primary outline tiny button" to="/customers/new">
                      <i className="add circle icon"></i>
                      {T.translate("customers.page.add_new_customer")}
                    </Link>
                  </div>
                </div>
            }

            { id &&
              <SelectField
                label={T.translate("projects.form.status")}
                name="status"
                type="select"
                value={status} 
                onChange={this.handleChange.bind(this)} 
                error={errors.staus}
                formClass="inline field"

                options={[
                  <option key="default" value="new" disabled>NEW</option>,
                  <option key="in progress" value="in progress">IN PROGRESS</option>,
                  <option key="finished" value="finished">FINISHED</option>,
                  <option key="delayed" value="delayed">DELAYED</option>,
                  <option key="delivered" value="delivered">DELIVERED</option>
                  ]
                }
              />
            }

            { id &&
              <div className="inline field progress">
                <div id="progress" className="ui success progress mb-3 mt-2">
                  <div className="bar" style={{transitionDuration: '300ms', width: ''+progress+'%'}}>
                    <div className="progress">{progress}%</div>
                  </div>
                </div>

                <div className="ui icon mini buttons">
                  <div className="decrement ui basic red button icon" onClick={this.handleDecreaseProgress.bind(this)}><i className="minus icon"></i></div>
                  <div className="increment ui basic green button icon" onClick={this.handleIncreaseProgress.bind(this)}><i className="plus icon"></i></div>
                </div>
              </div>
            }
              
            {/*
            <div className={classnames("field", { error: !!error.status })}>
              <label htmlFor="status">Status</label>
              <Dropdown 
                placeholder='Status' 
                search selection options={statusOptions}   
                value={status} 
                onChange={this.handleChange.bind(this)} 
                error={errors.status} />
            </div>      
            */}

            <TextAreaField
              label={T.translate("projects.form.description")}
              name="description" 
              value={description} 
              onChange={this.handleChange.bind(this)} 
              placeholder={T.translate("projects.form.description")}
              formClass="inline field"
            /> 

            <div className="inline field">    
              <Link className="ui primary outline button" to="/projects">
                <i className="minus circle icon"></i>
                {T.translate("projects.form.cancel")}
              </Link>
              <button disabled={isLoading} className="ui primary button"><i className="check circle outline icon" aria-hidden="true"></i>&nbsp;{T.translate("projects.form.save")}</button>
            </div>  
          </form> 
        </div>  
      </div>
    )
  }
}

Form.propTypes = {
  // saveProject: PropTypes.func.isRequired,
  // project: PropTypes.object,
  // customers: PropTypes.array.isRequired
}

Form.contextTypes = {
  router: PropTypes.object.isRequired
}

const createProjectMutation = gql`
  mutation createProject($name: String!, $deadline: Date!, $status: String!, $progress: Int, $description: String, $total: Int, $customerId: Int!) {
    createProject(name: $name, deadline: $deadline, status: $status, progress: $progress, description: $description, total: $total, customerId: $customerId) {
      success
      project {
        name
      }
      errors {
        path
        message
      }
    }
  }
`

const updateProjectMutation = gql`
  mutation updateProject($id: Int!, $name: String!, $deadline: Date!, $status: String!, $progress: Int, $description: String, $total: Int, $customerId: Int!) {
    updateProject(id: $id, name: $name, deadline: $deadline, status: $status, progress: $progress, description: $description, total: $total, customerId: $customerId) {
      success
      project {
        name
      }
      errors {
        path
        message
      }
    }
  }
`

const getCustomersQuery = gql`
  query {
    getCustomers {
      id
      name
    }
  }
`

const MutationsAndQuery =  compose(
  graphql(createProjectMutation, {
    name : 'createProjectMutation'
  }),
  graphql(updateProjectMutation, {
    name: 'updateProjectMutation'
  }),
  graphql(getCustomersQuery, {
    name: 'getCustomersQuery'
  })
)(Form)

export default MutationsAndQuery
