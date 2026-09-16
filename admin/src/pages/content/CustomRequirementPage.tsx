import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRef, useState } from 'react';
import useSWR from 'swr';

import { usePageTitle } from '@/hooks/usePageTitle';
import {
  getCustomRequirementList,
  getCustomRequirementDetail,
  getCustomRequirementNotificationAudits,
  manageCustomRequirementNotification,
  markCustomRequirementFollowed,
} from '@/services/content';
import { extractApiErrorMessage } from '@/services/http';
import {
  canShowNotificationError,
  getNotificationActionDisplay,
  getNotificationActions,
  getNotificationStatusDisplay,
  type NotificationActionDisplay,
  shortNotificationError,
} from '@/pages/content/custom-requirement-notification';
import {
  createLatestTargetRequestGuard,
  runLatestTargetRequest,
} from '@/pages/content/latest-target-request';
import {
  CustomRequirementEntity,
  CustomRequirementDetailEntity,
  CustomRequirementStatus,
  InquiryNotificationAction,
  InquiryNotificationAudit,
  InquiryNotificationStatus,
} from '@/types/content';

type Filters = {
  keyword: string;
  status?: CustomRequirementStatus;
};

type NotificationActionForm = {
  note: string;
};

type NotificationActionTarget = {
  record: CustomRequirementEntity;
  display: NotificationActionDisplay;
};

const DEFAULT_FILTERS: Filters = {
  keyword: '',
  status: undefined,
};

const statusOptions = [
  { label: '未跟进', value: 'pending' },
  { label: '已跟进', value: 'followed' },
];

function RequirementStatusTag({ status }: { status: CustomRequirementStatus }) {
  return status === 'followed' ? <Tag color="green">已跟进</Tag> : <Tag color="gold">未跟进</Tag>;
}

function NotificationStatusCell({ record }: { record: CustomRequirementEntity }) {
  const display = getNotificationStatusDisplay(record.notificationStatus);
  const error = shortNotificationError(record.notificationLastError);
  const showError = error && canShowNotificationError(record.notificationStatus);

  return (
    <Space size={4}>
      <Tag color={display.color}>{display.label}</Tag>
      {showError ? (
        <Tooltip title={error}>
          <span className="cursor-help text-xs text-gray-500 underline decoration-dotted">
            查看原因
          </span>
        </Tooltip>
      ) : null}
    </Space>
  );
}

const workpieceStateLabels: Record<string, string> = {
  purpose_unselected: '尚未选择处理目的',
  search_no_match: '搜索工件待工程确认',
  insufficient_conditions: '关键工况待补充',
  single_direction: '已形成一个公开方向',
  multiple_directions: '已形成多个公开方向',
  completed_pending_engineering: '初步条件已完成，待工程确认',
  engineering_review: '工程复核中',
  no_match: '现有条件未收敛',
  special_process_boundary: '专项工艺边界',
  invalid_input: '输入无效',
};

function WorkpieceContextPanel({ detail }: { detail: CustomRequirementDetailEntity }) {
  const context = detail.workpieceContext;
  if (!context) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该询盘未携带工件判断上下文" />;
  }

  return (
    <Card
      size="small"
      title="工件判断上下文"
      extra={<Tag color="blue">客户自报工况</Tag>}
      styles={{ body: { padding: 18 } }}
    >
      <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
        <Descriptions.Item label="工件分类">{context.categoryName}</Descriptions.Item>
        <Descriptions.Item label="工件名称">
          {context.workpieceName || '未匹配具体工件'}
        </Descriptions.Item>
        <Descriptions.Item label="搜索原词">{context.searchTerm || '-'}</Descriptions.Item>
        <Descriptions.Item label="处理目的">
          {context.processPurposeName || '未选择'}
        </Descriptions.Item>
        <Descriptions.Item label="服务端判断状态">
          {workpieceStateLabels[context.displayState] || '待工程确认'}
        </Descriptions.Item>
        <Descriptions.Item label="规则版本">{context.ruleVersion}</Descriptions.Item>
        <Descriptions.Item label="公开基线">
          {context.baselineVersion || '未签署'}
        </Descriptions.Item>
        <Descriptions.Item label="提交时间">
          {new Date(context.createdAt).toLocaleString('zh-CN')}
        </Descriptions.Item>
      </Descriptions>

      <Typography.Title level={5} style={{ margin: '16px 0 8px' }}>
        客户填写的原始工况
      </Typography.Title>
      {context.rawConditions.length ? (
        <Descriptions size="small" bordered column={{ xs: 1, sm: 2, lg: 3 }}>
          {context.rawConditions.map((item) => (
            <Descriptions.Item key={`${item.label}-${item.value}`} label={item.label}>
              {item.value}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : (
        <Typography.Text type="secondary">客户未填写具体工况。</Typography.Text>
      )}

      {context.missingConditions.length ? (
        <div style={{ marginTop: 14 }}>
          <Typography.Text strong>缺失或待确认：</Typography.Text>{' '}
          <Typography.Text>{context.missingConditions.join('、')}</Typography.Text>
        </div>
      ) : null}

      {context.publicDirections.length ? (
        <div style={{ marginTop: 14 }}>
          <Typography.Text strong>服务端公开方向：</Typography.Text>{' '}
          <Typography.Text>{context.publicDirections.join('、')}</Typography.Text>
        </div>
      ) : null}

      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        message="以上工况由客户自报，仅用于初步判断，最终以图纸、技术资料和工程确认结果为准。"
      />
    </Card>
  );
}

function isFormValidationError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'errorFields' in error);
}

const auditColumns: ColumnsType<InquiryNotificationAudit> = [
  {
    title: '处理时间',
    dataIndex: 'createdAt',
    width: 180,
    render: (value: string) => new Date(value).toLocaleString('zh-CN'),
  },
  {
    title: '操作人',
    width: 160,
    render: (_, record) => `${record.operatorUsername}（${record.operatorRole}）`,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    render: (value: InquiryNotificationAction) => getNotificationActionDisplay(value).buttonLabel,
  },
  {
    title: '状态变化',
    width: 170,
    render: (_, record) =>
      `${getNotificationStatusDisplay(record.previousStatus).label} → ${getNotificationStatusDisplay(record.nextStatus).label}`,
  },
  {
    title: '当时已尝试',
    dataIndex: 'attemptCount',
    width: 110,
    render: (value: number) => `${value} 次`,
  },
  {
    title: '处理备注',
    dataIndex: 'note',
    width: 260,
    ellipsis: true,
  },
  {
    title: '处理前错误',
    dataIndex: 'previousError',
    width: 220,
    ellipsis: true,
    render: (value?: string | null) => value || '-',
  },
];

export function CustomRequirementPage() {
  usePageTitle('客户非标需求');

  const { message, modal } = App.useApp();
  const [form] = Form.useForm<Filters>();
  const [notificationActionForm] = Form.useForm<NotificationActionForm>();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [notificationActionTarget, setNotificationActionTarget] =
    useState<NotificationActionTarget | null>(null);
  const [notificationSubmitting, setNotificationSubmitting] = useState(false);
  const [auditTarget, setAuditTarget] = useState<CustomRequirementEntity | null>(null);
  const [auditRows, setAuditRows] = useState<InquiryNotificationAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const auditRequestGuardRef = useRef(createLatestTargetRequestGuard());
  const [detailTargetId, setDetailTargetId] = useState<number | null>(null);
  const [detailRecord, setDetailRecord] = useState<CustomRequirementDetailEntity | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const detailRequestGuardRef = useRef(createLatestTargetRequestGuard());

  const { data, isLoading, error, mutate } = useSWR(['custom-requirements', page, filters], () =>
    getCustomRequirementList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      status: filters.status,
    }),
  );

  const openNotificationAction = (
    record: CustomRequirementEntity,
    display: NotificationActionDisplay,
  ) => {
    notificationActionForm.resetFields();
    setNotificationActionTarget({ record, display });
  };

  const submitNotificationAction = async () => {
    if (!notificationActionTarget) return;
    try {
      const values = await notificationActionForm.validateFields();
      setNotificationSubmitting(true);
      await manageCustomRequirementNotification(notificationActionTarget.record.id, {
        action: notificationActionTarget.display.action,
        expectedStateVersion: notificationActionTarget.record.notificationStateVersion,
        note: values.note.trim(),
      });
      message.success(notificationActionTarget.display.successMessage);
      setNotificationActionTarget(null);
      notificationActionForm.resetFields();
      try {
        await mutate();
      } catch (refreshError) {
        message.error(`操作已完成，但列表刷新失败：${extractApiErrorMessage(refreshError)}`);
      }
    } catch (actionError) {
      if (!isFormValidationError(actionError)) {
        message.error(`通知操作失败：${extractApiErrorMessage(actionError)}`);
      }
    } finally {
      setNotificationSubmitting(false);
    }
  };

  const loadNotificationAudits = async (record: CustomRequirementEntity) => {
    setAuditTarget(record);
    await runLatestTargetRequest({
      guard: auditRequestGuardRef.current,
      targetId: record.id,
      request: () => getCustomRequirementNotificationAudits(record.id),
      onStart: () => {
        setAuditLoading(true);
        setAuditError('');
        setAuditRows([]);
      },
      onSuccess: setAuditRows,
      onError: (auditRequestError) => {
        setAuditRows([]);
        setAuditError(extractApiErrorMessage(auditRequestError));
      },
      onSettled: () => setAuditLoading(false),
    });
  };

  const closeAuditModal = () => {
    auditRequestGuardRef.current.invalidate();
    setAuditTarget(null);
    setAuditRows([]);
    setAuditError('');
    setAuditLoading(false);
  };

  const closeRequirementDetail = () => {
    detailRequestGuardRef.current.invalidate();
    setDetailTargetId(null);
    setDetailRecord(null);
    setDetailError('');
    setDetailLoading(false);
  };

  const loadRequirementDetail = async (record: CustomRequirementEntity, force = false) => {
    if (detailTargetId === record.id && !force) {
      closeRequirementDetail();
      return;
    }
    setDetailTargetId(record.id);
    await runLatestTargetRequest({
      guard: detailRequestGuardRef.current,
      targetId: record.id,
      request: () => getCustomRequirementDetail(record.id),
      onStart: () => {
        setDetailLoading(true);
        setDetailError('');
        setDetailRecord(null);
      },
      onSuccess: setDetailRecord,
      onError: (detailRequestError) => {
        setDetailRecord(null);
        setDetailError(extractApiErrorMessage(detailRequestError));
      },
      onSettled: () => setDetailLoading(false),
    });
  };

  const columns: ColumnsType<CustomRequirementEntity> = [
    {
      title: '提交日期',
      dataIndex: 'createdAt',
      width: 180,
      render: (value?: string) => (value ? new Date(value).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '提交编号',
      dataIndex: 'submissionId',
      width: 220,
      ellipsis: true,
      render: (value?: string | null) => value || '-',
    },
    {
      title: '项目类型',
      dataIndex: 'projectType',
      width: 130,
      render: (value?: string | null) => value || '-',
    },
    {
      title: '项目地点',
      dataIndex: 'projectLocation',
      width: 160,
      render: (value?: string | null) => value || '-',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
      render: (value?: string | null) => value || '-',
    },
    {
      title: '电话 / 微信',
      dataIndex: 'phone',
      width: 150,
      render: (value?: string | null) => {
        if (!value) return '-';
        const dialable = /^[+()\d\s-]{6,}$/.test(value);
        return dialable ? <a href={`tel:${value}`}>{value}</a> : value;
      },
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 220,
      render: (value?: string | null) => (value ? <a href={`mailto:${value}`}>{value}</a> : '-'),
    },
    {
      title: '公司名称',
      dataIndex: 'company',
      width: 180,
      render: (value?: string | null) => value || '-',
    },
    {
      title: '设备需求',
      dataIndex: 'requirement',
      width: 260,
      ellipsis: true,
      render: (value?: string | null) => value || '-',
    },
    {
      title: '跟进状态',
      dataIndex: 'status',
      width: 110,
      render: (value: CustomRequirementStatus) => <RequirementStatusTag status={value} />,
    },
    {
      title: '通知状态',
      dataIndex: 'notificationStatus',
      width: 150,
      render: (_: InquiryNotificationStatus | null | undefined, record) => (
        <NotificationStatusCell record={record} />
      ),
    },
    {
      title: '通知操作',
      fixed: 'right',
      width: 330,
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {getNotificationActions(record.notificationStatus).map((display) => (
            <Button
              key={display.action}
              size="small"
              danger={display.danger}
              type={display.danger ? 'default' : 'primary'}
              onClick={() => openNotificationAction(record, display)}
            >
              {display.buttonLabel}
            </Button>
          ))}
          <Button size="small" onClick={() => void loadNotificationAudits(record)}>
            处理记录
          </Button>
        </Space>
      ),
    },
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size={6}>
          <Button size="small" onClick={() => void loadRequirementDetail(record)}>
            {detailTargetId === record.id ? '收起详情' : '工况详情'}
          </Button>
          <Button
            size="small"
            type="primary"
            disabled={record.status === 'followed'}
            onClick={() => {
              modal.confirm({
                title: '是否跟进？',
                content: '确认后，该需求状态将从未跟进变为已跟进。',
                okText: '是',
                cancelText: '否',
                onOk: async () => {
                  await markCustomRequirementFollowed(record.id);
                  message.success('已跟进');
                  await mutate();
                },
              });
            }}
          >
            跟进
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <Form
            form={form}
            layout="inline"
            initialValues={DEFAULT_FILTERS}
            onFinish={(values) => {
              setFilters(values);
              setPage(1);
            }}
          >
            <Form.Item name="keyword">
              <Input.Search
                allowClear
                placeholder="搜索编号 / 姓名 / 电话 / 邮箱 / 公司 / 地点"
                style={{ width: 300 }}
                onSearch={() => form.submit()}
              />
            </Form.Item>
            <Form.Item name="status">
              <Select
                allowClear
                placeholder="跟进状态"
                style={{ width: 140 }}
                options={statusOptions}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<CustomRequirementEntity>
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={data?.items || []}
            locale={
              error && !isLoading
                ? {
                    emptyText: (
                      <Space direction="vertical" size={8}>
                        <span>需求数据加载失败</span>
                        <Button size="small" onClick={() => void mutate()}>
                          重试
                        </Button>
                      </Space>
                    ),
                  }
                : undefined
            }
            expandable={{
              expandedRowKeys: detailTargetId ? [detailTargetId] : [],
              showExpandColumn: false,
              expandedRowRender: (record) => (
                <Spin spinning={detailLoading && detailTargetId === record.id}>
                  {detailError && detailTargetId === record.id ? (
                    <Alert
                      type="error"
                      showIcon
                      message="询盘详情加载失败"
                      description={detailError}
                      action={
                        <Button
                          size="small"
                          onClick={() => void loadRequirementDetail(record, true)}
                        >
                          重试
                        </Button>
                      }
                    />
                  ) : detailRecord?.id === record.id ? (
                    <WorkpieceContextPanel detail={detailRecord} />
                  ) : null}
                </Spin>
              ),
            }}
            scroll={{ x: 2330 }}
            pagination={{
              current: data?.page || page,
              pageSize: data?.pageSize || 10,
              total: data?.total || 0,
              onChange: (nextPage) => setPage(nextPage),
            }}
          />
        </Card>
      </Space>

      <Modal
        open={Boolean(notificationActionTarget)}
        title={notificationActionTarget?.display.modalTitle}
        okText={notificationActionTarget?.display.okText}
        cancelText="取消"
        okButtonProps={{ danger: notificationActionTarget?.display.danger }}
        confirmLoading={notificationSubmitting}
        maskClosable={!notificationSubmitting}
        onOk={() => void submitNotificationAction()}
        onCancel={() => {
          if (notificationSubmitting) return;
          setNotificationActionTarget(null);
          notificationActionForm.resetFields();
        }}
      >
        {notificationActionTarget?.record.notificationLastError ? (
          <Alert
            className="mb-4"
            type="warning"
            showIcon
            message="当前通知异常"
            description={shortNotificationError(
              notificationActionTarget.record.notificationLastError,
            )}
          />
        ) : null}
        <Form form={notificationActionForm} layout="vertical">
          <Form.Item
            name="note"
            label="处理备注"
            rules={[
              { required: true, whitespace: true, message: '请填写处理备注' },
              { max: 1000, message: '处理备注不能超过1000字' },
            ]}
          >
            <Input.TextArea
              rows={4}
              maxLength={1000}
              showCount
              placeholder="请说明核对依据和处理原因，便于后续追溯"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={Boolean(auditTarget)}
        width={1100}
        title={`通知处理记录${auditTarget?.submissionId ? `：${auditTarget.submissionId}` : ''}`}
        footer={<Button onClick={closeAuditModal}>关闭</Button>}
        onCancel={closeAuditModal}
      >
        <Spin spinning={auditLoading}>
          {auditError ? (
            <Alert
              type="error"
              showIcon
              message="处理记录加载失败"
              description={auditError}
              action={
                auditTarget ? (
                  <Button size="small" onClick={() => void loadNotificationAudits(auditTarget)}>
                    重试
                  </Button>
                ) : null
              }
            />
          ) : auditRows.length ? (
            <Table<InquiryNotificationAudit>
              className="mt-2"
              size="small"
              rowKey={(record) =>
                record.id ?? `${record.createdAt}-${record.operatorUsername}-${record.action}`
              }
              columns={auditColumns}
              dataSource={auditRows}
              pagination={false}
              scroll={{ x: 1300 }}
            />
          ) : !auditLoading ? (
            <Empty description="暂无人工处理记录" />
          ) : null}
        </Spin>
      </Modal>
    </>
  );
}
