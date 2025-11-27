"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Popconfirm } from "antd";
import { Trash2, Check, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getAllComments,
  approveComment,
  rejectComment,
  deleteComment,
} from "@/app/actions/blog/comment.actions";

const CommentList = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchComments = async () => {
    setLoading(true);
    const res = await getAllComments(filter);
    if (res.success) setComments(res.comments);
    else toast.error(res.msg || "Failed to fetch comments");
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const handleApprove = async (id) => {
    const res = await approveComment(id);
    if (res.success) {
      toast.success(res.msg);
      fetchComments();
    } else toast.error(res.msg);
  };

  const handleReject = async (id) => {
    const res = await rejectComment(id);
    if (res.success) {
      toast.success(res.msg);
      fetchComments();
    } else toast.error(res.msg);
  };

  const handleDelete = async (id) => {
    const res = await deleteComment(id);
    if (res.success) {
      toast.success(res.msg);
      fetchComments();
    } else toast.error(res.msg);
  };

  const statusTag = (approved) => {
    if (approved === true) return <Tag color="green">Approved</Tag>;
    if (approved === false) return <Tag color="red">Rejected</Tag>;
    return <Tag color="orange">Pending</Tag>;
  };

  const columns = [
    { title: "SL", key: "sl", render: (_, __, index) => index + 1 },
    { title: "Name", dataIndex: "name", key: "name", render: (v) => <span className="font-medium">{v}</span> },
    { title: "Comment", dataIndex: "content", key: "content", render: (v) => <span className="text-gray-700">{v}</span> },
    { title: "Post", key: "post", render: (_, record) => <span className="font-medium text-blue-600">{record?.post?.title || "N/A"}</span> },
    { title: "Author", key: "author", render: (_, record) => <span className="text-gray-600">{record?.post?.author?.name || "N/A"}</span> },
    { title: "Status", dataIndex: "approved", key: "approved", render: (approved) => statusTag(approved) },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.approved !== true && <Check className="w-7 h-7 rounded-md p-1 bg-green-500 text-white cursor-pointer" onClick={() => handleApprove(record.id)} />}
          {record.approved !== false && <XCircle className="w-7 h-7 bg-orange-500 p-1 rounded-md text-white cursor-pointer" onClick={() => handleReject(record.id)} />}
          <Popconfirm
            title="Are you sure to delete this comment?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Trash2 className="w-7 h-7 rounded-md bg-red-500 text-white cursor-pointer p-1" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="mx-5 mt-10 p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Comments <span>({comments.length})</span>
        </h2>
        <div className="flex gap-2">
          {["all", "approved", "rejected", "pending"].map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      <Table
        dataSource={comments}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 6  }}
      />
    </div>
  );
};

export default CommentList;
