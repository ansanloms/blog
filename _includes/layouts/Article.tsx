import * as datetime from "std/datetime/mod.ts";
import Base from "./Base.tsx";

type Props = {
  title: string;
  postDate: string;
  updateDate?: string;
  tags?: string[];
  children: Node;
};

export default (props: Props) => (
  <Base title={props.title} layout="article">
    {props.tags && (
      <ul className="tags">
        {props.tags.map((tag) => <li>{tag}</li>)}
      </ul>
    )}
    <div className="meta">
      <p className="postDate">
        <span className="label">投稿</span>
        <span className="date">
          {datetime.format(new Date(props.postDate), "yyyy.MM.dd")}
        </span>
      </p>
      {props.updateDate && (
        <p className="updateDate">
          <span className="label">更新</span>
          <span className="date">
            {datetime.format(new Date(props.updateDate), "yyyy.MM.dd")}
          </span>
        </p>
      )}
    </div>
    <article className="article">
      <h1>{props.title}</h1>
      {props.children}
    </article>
  </Base>
);
