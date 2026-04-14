"use client";

import React, { useTransition } from "react";
import { Table, Space, Dropdown, Popconfirm } from "antd";
import {
  HeartOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { toast } from "sonner";
import { deletePost, updatePostStatus } from "@/app/actions/blog/blog.actions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { USER_ROLES } from "@/lib/access";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

const STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Pending", value: "PENDING" },
  { label: "Publish", value: "PUBLISH" },
  { label: "Decline", value: "DECLINE" },
];

const blogData = [
  {
    id: 1,
    title:
      "The Impact of Technology on the Workplace: How Technology is Changing",
    author: {
      name: "Harun Or Rashid",
      avatar: "https://via.placeholder.com/40.png?text=HR",
    },
    likes: 120,
    comments: 15,
    date: "2025-09-10",
  },
  {
    id: 2,
    title:
      "The Impact of Technology on the Workplace: How Technology is Changing",
    author: {
      name: "Arif Ahmed",
      avatar: "https://via.placeholder.com/40.png?text=AA",
    },
    likes: 85,
    comments: 10,
    date: "2025-09-11",
  },
  {
    id: 3,
    title:
      "The Impact of Technology on the Workplace: How Technology is Changing",
    author: {
      name: "Fatema Begum",
      avatar: "https://via.placeholder.com/40.png?text=FB",
    },
    likes: 200,
    comments: 30,
    date: "2025-09-12",
  },
  {
    id: 4,
    title: "Next.js 15 Released: What's New and Improved",
    author: {
      name: "Sabbir Hossain",
      avatar: "https://via.placeholder.com/40.png?text=SH",
    },
    likes: 90,
    comments: 12,
    date: "2025-09-08",
  },
  {
    id: 5,
    title: "Exploring Tailwind CSS v4: The Future of Styling",
    author: {
      name: "Nusrat Jahan",
      avatar: "https://via.placeholder.com/40.png?text=NJ",
    },
    likes: 150,
    comments: 25,
    date: "2025-09-07",
  },
  {
    id: 6,
    title: "Understanding Prisma with PostgreSQL",
    author: {
      name: "Rakibul Hasan",
      avatar: "https://via.placeholder.com/40.png?text=RH",
    },
    likes: 60,
    comments: 7,
    date: "2025-09-05",
  },
];

const BlogTable = ({ allPost }) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === USER_ROLES.ADMIN;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async (id) => {
    try {
      const res = await deletePost(id);
      if (res.success) {
        toast.success(res.msg);
        // refresh table or filter out deleted post
      } else {
        toast.error(res.msg);
      }
    } catch (err) {
      toast.error("Something went wrong while deleting the post");
    }
  };

  const handleStatusChange = (record, newStatus) => {
    if (newStatus === record.status) return;
    const proceed = async () => {
      let note = null;
      if (newStatus === "DECLINE") {
        note = window.prompt("Provide decline instructions for the author");
        if (!note) {
          toast.error("Decline note is required");
          return;
        }
      }
      startTransition(async () => {
        const result = await updatePostStatus({
          postId: record.id,
          status: newStatus,
          note,
        });
        if (result.success) {
          toast.success(result.msg);
          router.refresh();
        } else {
          toast.error(result.msg);
        }
      });
    };

    proceed();
  };
  const getMenuItems = (record) => [
    {
      key: "edit",
      label: (
        <Link href={`/dashboard/blog/edit/${record.id}`}>
          <EditOutlined className='mr-2 text-blue-600' />
          Edit
        </Link>
      ),
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title='Are you sure you want to delete this post?'
          onConfirm={() => handleDelete(record.id)}
          okText='Yes'
          cancelText='No'
        >
          <span>
            <DeleteOutlined className='mr-2 text-red-600' />
            Delete
          </span>
        </Popconfirm>
      ),
    },
    // {
    //   key: "view",
    //   label: (
    //     <span>
    //       <EyeOutlined className='mr-2' />
    //       View
    //     </span>
    //   ),
    // },
  ];

  const columns = [
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      render: (author, record) => (
        <Space>
        <span className='h-8 w-8 overflow-hidden rounded-lg bg-slate-100'>
          <Image
            src={
              record?.bannerImage &&
              record.bannerImage !== "undefined" &&
              record.bannerImage.trim() !== ""
                ? record.bannerImage
                : "/banner.png"
            }
            alt={record.title || "Blog banner"}
            width={40}
            height={40}
            className='h-8 w-8 object-cover'
            unoptimized
          />
        </span>
          <span>{author?.name || "Unknown"}</span>
         
        </Space>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title) => <span className='font-medium'>{title}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      title: "Comments",
      key: "stats",
      render: (_, record) => (
        <Space>
          <span>
            <MessageOutlined className='mr-1' />
            {record.comments}
          </span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const label = status || "PENDING";
        const tone =
          label === "PUBLISH"
            ? "text-emerald-600 border-emerald-200 bg-emerald-50"
            : label === "DECLINE"
              ? "text-red-600 border-red-200 bg-red-50"
              : "text-amber-600 border-amber-200 bg-amber-50";

        if (isAdmin) {
          const items = STATUS_OPTIONS.map((option) => ({
            key: option.value,
            label: (
              <span className='flex items-center justify-between'>
                <span>{option.label}</span>
                {option.value === label && (
                  <span className='text-[11px] font-semibold text-slate-400'>
                    current
                  </span>
                )}
              </span>
            ),
            onClick: () => handleStatusChange(record, option.value),
          }));

          return (
            <Dropdown
              menu={{ items }}
              trigger={["click"]}
              placement='bottomRight'
            >
              <span
                className={`flex cursor-pointer items-center justify-between rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}
              >
                <span className='flex items-center gap-1'>
                  {label}
                  <ChevronDown className='h-3 w-3 text-current' />
                </span>
                <span className='text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  change
                </span>
              </span>
            </Dropdown>
          );
        }

        return (
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
          trigger={["click"]}
          placement='bottomRight'
        >
          <MoreOutlined className='text-xl cursor-pointer' />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className='py-6'>
      <Table
        dataSource={allPost?.postsWithContentObj}
        columns={columns}
        rowKey='id'
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        bordered={false}
      />
    </div>
  );
};

export default BlogTable;
