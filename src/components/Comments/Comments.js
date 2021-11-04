import React from 'react'
import CommentsItem from '../CommentsItem/CommentsItem'

export default function Comments(props) {
    return (
        <div className="comments_list">
            <h3>User Comments</h3>
            <hr />
            {
                props.data.length > 0 && props.data.map((item, i) => <CommentsItem key={i} name={item.user_name} text={item.text}/>)
            }
        </div>
    )
}