
type Props = {
    title: string
    description: string
}

const Login = (props: Props) => {
    return (
        <div>Login {props.title} - {props.description}</div>
    )
}
export default Login