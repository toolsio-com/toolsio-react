import React, { Component } from 'react'
import decode from 'jwt-decode'
import { getSubdomain } from '../../utils'
// Semantic UI Form elements
import { Grid, Segment, Item, Divider } from 'semantic-ui-react'
import AccountForm from './AccountForm'
import UserForm from './UserForm'

class Page extends Component {

  render() {
    
    // Parse subdomain 
    let subdomain =  getSubdomain()

    let currentUser
    
    try {
      const authToken = localStorage.getItem('authToken')
      const { account, user } = decode(authToken)

      currentUser = { account, user } 

    } catch(err) {
      console.log('err: ', err)
    }
    
    return (
      <Grid.Row>
        <Grid.Column width={12}>         
          <Segment className="account">
            <Item.Group>
              <AccountForm subdomain={subdomain} /> 
            </Item.Group>
          </Segment>

          <Divider />
          
          <Segment className="user">
            <Item.Group>
              { currentUser.user.email && <UserForm email={currentUser.user.email} /> }
            </Item.Group>
          </Segment>
        </Grid.Column>
      </Grid.Row>  
    )
  }
}

export default Page


