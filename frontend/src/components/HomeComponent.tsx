import { useState } from "react";
import "../App.css";

interface HomeComponentProps {
}

const HomeComponent: React.FC<HomeComponentProps> = ({}) => {

  return (
    <h1 className="text-5xl"> Welcome to the home</h1>
  );
}

export default HomeComponent;