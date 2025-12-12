import {useState} from 'react'
import {useNavigate, useLocation} from 'react-router'
import {styled} from '@mui/material/styles'
import Snow from '../components/Snow'
import {post} from '@workspace/shared-util'

import {Box, Paper, TextField, Button, Typography, Container} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

const LoginContainer = styled(Container)({
    display: 'flex',
    justifyContent:'center',
    alignItems: 'center',
    height: '100vh',
    zIndex: 2,
    position: 'relative'
})

const OptionsContainer = styled(Box)({
    display:'flex',
    justifyContent: 'space-between',
    width:'100%',
    fontSize: '12px',
    marginTop: '8px',
    marginBottom: '16px'

})

const LoginPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(4),
    display:'flex',
    flexDirection:'column',
    aliginItems:'center',
    maxWidth: '400px',
    width: '100%',
    borderRadius:'8%',
    backgroundColor:'rgba(255, 255,255, 0.4)'
}))

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorInfo, setErrorInfo] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation();

    const handleLogin  = async(e) => {
        e.preventDefault()
        setIsLoading(true)
        setErrorInfo("please approve on your phone")
        localStorage.setItem('token', 'success');
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });

        try {
            // const response = await post('//', {
            //     username:username,
            //     password:password
            // }, {timeout:150000})

            // if (response && response.request.state != 200) {
            //     console.log(`login fail with ${response.message}`)
            //     setIsLoading(false)
            //     setErrorInfo(response.message)
            // } else {
            //     console.log('Login successful')
            //     setIsLoading(false)
            //     setErrorInfo('')
            //     navigate('/')
            // }


        } catch (error){
            setIsLoading(error)
            console.log("Error sending message")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Container
            maxWidth={false}
            disableGutters={true}
            sx={{
                backgroundImage:`url("/static/images/bg/bg1.jpg")`,
                backgroundSize:'cover',
                backgroundPosition:'center',
                minHeight: '100vh',
                position:'relative',
                overflow:'hidden'
            }}
        >
            <Snow />
            <LoginContainer>
                <LoginPaper elevation={3}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ width: '100%', textAlign: 'center', fontWeight: 600 }}>
                            Accurate Did
                    </Typography>
                    <Box component="form" onSubmit={handleLogin} sx={{mt:1, width: '100%'}} noValidate>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="username"
                          label="User Name"
                          name="username"
                          autoComplete="username"
                          autoFocus
                          value={username}
                          InputLabelProps={{ shrink: true }} 
                          onChange={(e) => setUsername(e.target.value)}
                          sx={{
                                '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.65)' },
                                '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.9)' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'rgba(255,255,255,0.9)' },
                                '& .MuiOutlinedInput-input': {color: '#000'},
                          }}
                        />
                      <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="password"
                          label="Password"
                          type="password"
                          name="password"
                          autoComplete="current-password"
                          autoFocus
                          value={password}
                          InputLabelProps={{ shrink: true }} 
                          onChange={(e) => setPassword(e.target.value)}
                          sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(255,255,255,0.08)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.65)' },
                                    '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.9)' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'rgba(255,255,255,0.9)' },
                                '& .MuiOutlinedInput-input': {color: '#000'},
                          }}
                        />
                        <OptionsContainer>
                            <div>Remember me</div>
                            <div>Forget Password</div>
                        </OptionsContainer>
                        {errorInfo !=='' && (
                            <div className='text-red-500'>{errorInfo}</div>
                        )}
                        <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            borderRadius: '20px',
                            fontWeight: 600,
                            textTransform: 'none',
                            color: '#fff',                                   
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',    
                            backdropFilter: 'blur(4px)',                     
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            },
                        }}
                        >
                        {isLoading ? <CircularProgress color="inherit" />: 'Login'}
                     </Button>
                    </Box>
                </LoginPaper>
            </LoginContainer>
        </Container>
    )
    
}

export default Login



