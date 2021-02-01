import styled from "styled-components";

const Container = styled.div`
  background: red;
`;

const Layout = ({ children }) => <Container>{children}</Container>;

export default Layout;
