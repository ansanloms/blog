import Base from "./Base.tsx";

type Props = {
  children: Node;
};

export default (props: Props) => (
  <Base title="ansanloms blog" layout="top">
    {props.children}
  </Base>
);
