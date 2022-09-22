import Base from "./Base.tsx";

type Props = {
  title: string;
  date: string;
  children: Node;
};

export default (props: Props) => (
  <Base title={props.title} layout="article">
    <article className="article">
      <h1>{props.title}</h1>
      {props.children}
    </article>
  </Base>
);
