<template>
  <!-- <div class="recording"> -->
  <div class="app-container">
    <div class="screen">
      <span class="demonstration">录音主机</span>
      <el-cascader
        :options="options"
        :props="props"
        collapse-tags
        clearable
      />
      <span class="demonstration">时间</span>
      <el-date-picker
        v-model="value2"
        type="datetimerange"
        :picker-options="pickerOptions"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="center"
      />
      <span class="demonstration">录音类型</span>
      <el-select
        v-model="value1"
        multiple
        collapse-tags
        style="margin-left: 20px;"
        placeholder="请选择"
      >
        <el-option
          v-for="item in options1"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span class="demonstration">敏感词</span>
      <el-select
        v-model="value3"
        multiple
        collapse-tags
        style="margin-left: 20px;"
        placeholder="请选择"
      >
        <el-option
          v-for="item in options1"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button type="info" icon="el-icon-search">搜索</el-button>
      <el-popconfirm
        confirm-button-text="好的"
        cancel-button-text="不用了"
        icon="el-icon-info"
        icon-color="red"
        title="这是一段内容确定删除吗？"
        @onConfirm="del_Recording_record"
      >
        <!-- <el-button slot="reference">删除</el-button> -->
        <el-button slot="reference" type="info" icon="el-icon-delete-solid">删除</el-button>
      </el-popconfirm>

      <!-- <el-button type="info" icon="el-icon-delete-solid" @click="del_Recording_record">删除</el-button> -->
      <el-button type="info"><svg-icon icon-class="导出" />&nbsp;导出</el-button>
    </div>
    <!-- 表单 -->
    <!-- <div class="app-container"> -->
    <el-table
      v-loading="listLoading"
      :data="lists"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="Title">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="Author" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Pageviews" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.pageviews }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Display_time" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- </div> -->
    <div class="paging">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        :pager-count="pagerCount"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <div>
      <audio src="http://wvideo.spriteapp.cn/video/2016/0328/56f8ec01d9bfe_wpd.mp4" />
    </div>
  </div>
</template>

<script>
import { getList } from '@/api/table'
export default {
  name: 'Recording',
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      value2: '',
      props: { multiple: true },
      options: [
        {
          value: 2,
          label: '上海',
          children: [
            { value: 3, label: '普陀' },
            { value: 4, label: '黄埔' },
            { value: 5, label: '徐汇' }
          ]
        }, {
          value: 7,
          label: '江苏',
          children: [
            { value: 8, label: '南京' },
            { value: 9, label: '苏州' },
            { value: 10, label: '无锡' }
          ]
        }, {
          value: 12,
          label: '浙江',
          children: [
            { value: 13, label: '杭州' },
            { value: 14, label: '宁波' },
            { value: 15, label: '嘉兴' }
          ]
        }, {
          value: 18,
          label: '陕西',
          children: [
            { value: 19, label: '西安' },
            { value: 20, label: '延安' }
          ]
        }, {
          value: 21,
          label: '新疆维吾尔族自治区',
          children: [
            { value: 22, label: '乌鲁木齐' },
            { value: 23, label: '克拉玛依' }
          ]
        }],
      options1: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      value1: [],
      value3: [],
      list: null,
      lists: null,
      listLoading: true,
      currentPage: 1,
      pageSize: 10,
      pagerCount: 7,
      total: 0,
      multipleSelection: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 判断是否选中数据
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(this.multipleSelection)
    },
    fetchData() {
      this.listLoading = true
      getList().then(response => {
        this.list = response.data.items
        this.total = this.list.length
        this.paging()
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.paging()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.currentPage = val
      this.paging()
    },
    paging() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = this.currentPage * this.pageSize
      this.lists = this.list.slice(start, end)
    },
    del_Recording_record() {
      const num = this.multipleSelection
      if (num.toString()) {
        this.$message({
          showClose: true,
          message: '删除成功',
          type: 'success'
        })
      } else {
        this.$message({
          customClass: 'msg',
          showClose: true,
          message: '请选择要删除的记录',
          type: 'warning'
        })
      }
    }
  }
}
</script>

<style>
  .screen{
    padding-bottom: 15px;
  }
  .paging{
    padding-top: 15px;
  }
</style>
