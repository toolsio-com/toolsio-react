import React, { Component } from 'react' 
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Validation } from '../../utils'
import { InputField, SelectField } from '../../utils/FormFields'
import classnames from 'classnames'

// Localization 
import T from 'i18n-react'

class Form extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: {
        subdomain: '', 
        industry: ''
      },
      user: {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: ''
      },
      errors: {
        message: {
          errors: {}
        }
      },
      isLoading: false,
      invalid: false
    }
  }
  
  handleChange(e) {
    if (e.target.name === "subdomain" || e.target.name === "industry") {
      this.setState({
        account: { ...this.state.account, [e.target.name]: e.target.value }
      })
    }
    else if (e.target.name === "first_name" || e.target.name === "last_name" || e.target.name === "email"
        || e.target.name === "password" || e.target.name === "confirm_password") {
      this.setState({
        user: { ...this.state.user, [e.target.name]: e.target.value }
      })
    }  
  }

  checkAccountAndEmailExist(e) {
    const field = e.target.name
    const val = e.target.value
    if (val !== '') {
      this.props.isSubdomainExist(val).then(res => {
        let errors = this.state.errors
        let invalid

        if (res.data.result !== null) {
          errors['message'] = {
            errors: {
              subdomain: {
                message: 'There is an account with such '+field+ ' subdomain.'
              }  
            }  
          }
          invalid = true
        } 

        if (res.data.result === null) {
          errors[field] = ''
          invalid = false
        }

        this.setState({ errors, invalid })
      })
    }
  }

  isValid() {
    const { errors, isValid } = Validation.validateRegistrationInput(this.state)

    let updatedErrors = Object.assign({}, this.state.errors)
    updatedErrors.message.errors = errors

    if (!isValid) {
      this.setState({ errors: updatedErrors })
    }

    return isValid;
  }

  handleSubmit(e) {
    e.preventDefault()

    if (this.isValid()) { 
      // Empty errros state for each submit
      this.setState({ errros: {}, isLoading: true })
      
      const { account, user } = this.state
      // Make submit
      this.props.signupRequest({account, user}).then(
        (res) => {
          this.props.addFlashMessage({
            type: 'success',
            text: T.translate("sign_up.success_create")
          })
          window.location = `${process.env.HTP}${this.props.currentAccount.subdomain}.${process.env.DNS}/login`
        },
        ({ response }) => this.setState({ errors: response.data.errors, isLoading: false })
      )
    }  
  }

  render() {
    const { account, user, errors, isLoading, invalid } = this.state
   
    return (            
      <form className={classnames("ui large form", { loading: isLoading })} onSubmit={this.handleSubmit.bind(this)}>
        <div className="ui stacked segment">
           
          { !!errors.message && (typeof errors.message === "string") && <div className="ui negative message"><p>{errors.message}</p></div> } 
          
          <InputField
            id='first_name'
            label={T.translate("sign_up.first_name")}
            name="first_name" 
            value={user.first_name} 
            onChange={this.handleChange.bind(this)} 
            placeholder={T.translate("sign_up.first_name")}
            formClass="field"
          />
          <InputField
            id='last_name'
            label={T.translate("sign_up.last_name")}
            name="last_name" 
            value={user.last_name} 
            onChange={this.handleChange.bind(this)} 
            placeholder={T.translate("sign_up.last_name")}
            formClass="field"
          />
          <InputField
            type="email"
            name="email" 
            value={user.email} 
            id='email'
            label={T.translate("sign_up.email")}
            onChange={this.handleChange.bind(this)} 
            placeholder={T.translate("sign_up.email")}
            error={errors.message && errors.message.errors && errors.message.errors['email'] && errors.message.errors['email'].message}
            formClass="field"
          />
          <InputField
            type="password"
            name="password" 
            value={user.password} 
            id="password"
            label={T.translate("sign_up.password")}
            onChange={this.handleChange.bind(this)} 
            placeholder={T.translate("sign_up.password")}
            error={errors.message && errors.message.errors && errors.message.errors['password'] && errors.message.errors['password'].message}
            formClass="field"
          />
          <InputField
            type="password"
            name="confirm_password" 
            value={user.confirm_password} 
            id="confirm_password"
            label={T.translate("sign_up.confirm_password")}
            onChange={this.handleChange.bind(this)} 
            placeholder={T.translate("sign_up.confirm_password")}
            error={errors.confirm_password}
            formClass="field"
          />
          <SelectField
            type="select"
            name="industry"
            value={account.industry} 
            label={T.translate("sign_up.account.industry")}
            onChange={this.handleChange.bind(this)} 
            error={errors.message && errors.message.errors && errors.message.errors.industry && errors.message.errors['industry'].message}
            formClass="field"

            options={[
              <option key="default" value="" disabled>{T.translate("sign_up.account.select_industry")}</option>,
              <option key="human resource" value="human resource">Human resource</option>,
              <option key="fashion" value="fashion">Fashion</option>,
              <option key="import/export" value="import/export">Import/Export</option>,
              <option key="store" value="store">Store</option>,
              <option key="technology" value="technology">Technology</option>
              ]
            }
          />
          <div className={classnames("field", { error: !!errors.message && errors.message.errors && errors.message.errors.subdomain })}>
            <label>{T.translate("sign_up.account.subdomain")}</label>
            <div className="ui right labeled input">
              <input type="text" name="subdomain" id="subdomain" placeholder={T.translate("sign_up.account.subdomain")} 
                onBlur={this.checkAccountAndEmailExist.bind(this)} value={account.subdomain} onChange={this.handleChange.bind(this)} />
              <div className="ui label">toolsio.com</div>  
            </div>
            <span className="red">{errors.message && errors.message.errors && errors.message.errors.subdomain && errors.message.errors.subdomain.message}</span>
          </div>  

          <button disabled={isLoading || invalid} className="ui fluid large teal submit button">{T.translate("sign_up.sign_up")}</button>
        </div>
      </form>         

    )
  }
}

// Proptypes definition
Form.propTypes = {
  signupRequest: PropTypes.func.isRequired,
  addFlashMessage: PropTypes.func.isRequired,
  isSubdomainExist: PropTypes.func.isRequired,
  isUserExist: PropTypes.func.isRequired
}

// Contexttype definition
Form.contextTypes = {
  router: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    currentAccount: state.authentication && state.authentication.currentAccount
  } 
}

export default connect(mapStateToProps, {}) (Form)


