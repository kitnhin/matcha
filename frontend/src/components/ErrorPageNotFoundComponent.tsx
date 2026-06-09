import "../App.css";

interface ErrorPageNotFoundComponentProps {}

const ErrorPageNotFoundComponent: React.FC<
  ErrorPageNotFoundComponentProps
> = ({}) => {
  return (
    <h1 className="min-w-screen text-center text-5xl mt-10">
      Error 404: Page Not Found
    </h1>
  );
};

export default ErrorPageNotFoundComponent;
