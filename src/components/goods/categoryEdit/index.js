//@flow
import React, { Component } from "react";
import { connect } from "react-redux";
import { Form, Select, Input, Button, message } from 'antd';
import UploadImage from "../../../components/uploadImage";
import {
    handleSubmitType,
    formType,
    dispatchType,
    historyType,
} from "../../../utils/flow";
import {
    getGoodsCategoryList,
    editCategory,
} from "../../../actions/goods/category";
import {
    Fetch,
    publicFunction,
} from "../../../utils";
import { GoodsApi } from "../../../config/api/goods";

const {
    parseQuery
} = publicFunction
const FormItem = Form.Item;
const Option = Select.Option;

type Props = {
    categoryList: Array<{ id: number, name: string }>,
    form: formType,
    dispatch: dispatchType,
    location: {
        state?: {
            categoryInfo?: { name: string, pid: number, icon: string }
        },
        search: string,
    },
    history: historyType,
}
type State = {
    categoryInfo: { name?: string, pid?: number, icon?: string } | {}
}

@connect(({
              view: {
                  goods: {
                      categoryList,
                  }
              }
          }) => ({
    categoryList,
}))
@Form.create()
export default class CategoryEdit extends Component <Props, State> {
    state = {
        categoryInfo: this.props.location.state ? this.props.location.state.categoryInfo : null
    }

    async componentDidMount() {
        const {
            dispatch,
            categoryList,
            location: {
                state,
                search,
            },
        } = this.props
        if (!categoryList.length) {
            dispatch(getGoodsCategoryList())
        }
        const {
            id
        } = parseQuery(search)
        if (!id) {
            return message.error('缺少必要参数，history异常')
        }
        if (!state || !state.categoryInfo) {
            const e = await Fetch.fetch({
                api: GoodsApi.category.info,
                params: {
                    id
                }
            })
            this.setState({
                categoryInfo: e.result.info
            })
        }
    }

    handleSubmit = (e: handleSubmitType) => {
        const {
            id
        } = parseQuery(this.props.location.search)
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {
                    dispatch
                } = this.props
                dispatch(editCategory({
                    params: {
                        ...values,
                        ...{ id }
                    },
                }))
            }
        })
    }

    render() {
        const {
            form,
            categoryList,
        } = this.props
        const { categoryInfo } = this.state
        const { name, pid, icon } = categoryInfo || {}
        const { getFieldDecorator } = form
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 6,
                },
            },
        };
        let hasChild = false
        // 如果存在子分类不可以设所属
        if (categoryInfo && Array.isArray(categoryList) && categoryList.length > 0) {
            categoryList.map((e, i) => {
                 (hasChild === false && e.pid === categoryInfo.id) ? hasChild = true : null
            })
            return (
                <Form onSubmit={this.handleSubmit} style={{ maxWidth: '600px' }}>
                    <FormItem
                        label="分类名称"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('name', {
                            initialValue: name,
                            rules: [{
                                required: true,
                                message: '请输入分类名称!'
                            }],
                        })(
                            <Input
                                placeholder='请输入分类名称'
                                style={{ width: '100%' }}
                            />
                        )}
                    </FormItem>
                    { hasChild === false ? <FormItem
                        label="上级分类"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('pid', {
                            initialValue: pid === 0 ? 0 : pid,
                        })(
                            <Select
                                placeholder="请输入分类名称"
                                style={{ width: '100%' }}
                            >
                                <Option value={0} key={0}>设为一级分类</Option>
                                {
                                    (Array.isArray(categoryList) && categoryList.length > 0) ? categoryList.map((e, i) => {
                                        return e.id !== categoryInfo.id ?
                                            <Option value={e.id} key={i}>{e.name}</Option> : null
                                    }) : null
                                }
                            </Select>
                        )}
                    </FormItem> : null}
                    <FormItem
                        {...formItemLayout}
                        extra="分类展示图，建议尺寸：140*140 像素"
                        label="上传分类图"
                    >
                        {getFieldDecorator('icon', {
                            initialValue: icon,
                            rules: [{
                                message: '请上传分类图!',
                            }],
                            valuePropName: 'url',
                        })(
                            <UploadImage />
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{
                                marginRight: 10
                            }}
                            onClick={() => {

                            }}
                        >
                            保存
                        </Button>
                        <Button
                            onClick={() => {
                                this.props.history.goBack()
                            }}
                        >
                            返回
                        </Button>
                    </FormItem>
                </Form>
            )
        }else{
            return ''
        }


    }
}
