# Description
This module Authenticate Users
supporetd:
- username and password
- oauth (not completed)
- telegram (not completed)

# Configuration

    {
        name:'auth',
        userpass:{
            context:'{database connection name}',
            requireEmail:true,//verification Email
            requireMobile:true,//verification Mobile
            addItems:[{name:'company',required:true}],
            superadmin:{
                username:{sadmin username} ',
                password:'{admin password}'
            }
        }
    }
    
# How to use

- Login     
    
    http://example.com/auth/login?username=vahid&password=123456789

- IsLogin

    http://example.com/auth/islogin   
    
- Logout

    http://example.com/auth/logout
    
- register

    http://example.com/auth/register?username=vahid&password=1212&email=vahid.hossaini@gmail.com&mobile=09378092520&company=hhhh
    
- ChangePassword
    
    http://example.com/auth/changePassword?username=vahid3&oldPassword=1112&newPassword=1111
    
- FrogetPassword
    
    http://example.com/auth/forgetPassword?name={username or email}
    
- ResetPassword

    http://example.com/auth/resetPassword?username=vahid3&code=af66b589-819b-43e9-b46a-a9550daa7b96&newPassword=1113
    
- Verify

    http://example.com/auth/verify?name=vahid@gmail.com&code=6655a71e-b848-4d3b-8232-c944911e1226&type=email
    http://example.com/auth/verify?name=vahid@gmail.com&code=daae7551-fee0-4f78-b3d3-d8a67f964a54&type=mobile
    
- Two Step Login

    http://example.com/auth/twoStep?username=vahid3&code=3743
                