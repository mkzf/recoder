<template>
  <div class="app-container">
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="
        tableDatas.filter(
          data =>
            !search ||
            data.usr_name.toLowerCase().includes(search.toLowerCase())
        )
      "
      tooltip-effect="dark"
      style="width: 100%"
      show-header
      empty-text
      :row-class-name="tableRowClassName"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" :selectable="selectable" />
      <el-table-column
        prop="usr_guid"
        label="id"
        width="200"
        show-overflow-tooltip
        header-align="center"
        align="center"
      >
        <!-- <template slot-scope="scope">{{ scope.row.usr_guid }}</template> -->
      </el-table-column>
      <el-table-column
        prop="usr_name"
        label="姓名"
        width="200"
        header-align="center"
        align="center"
      />
      <el-table-column
        label="密码"
        width="200"
        header-align="center"
        align="center"
      >
        <template>******</template>
      </el-table-column>
      <el-table-column
        prop="usr_state"
        sortable
        :sort-orders="['ascending', 'descending']"
        :formatter="stateFormatter"
        label="状态"
        width="200"
        header-align="center"
        align="center"
      >
        <!-- <template slot-scope="scope">{{ scope.row.usr_state===1 ? '在线' : '离线' }}</template> -->
      </el-table-column>
      <el-table-column
        prop="usr_type"
        sortable
        :sort-orders="['ascending', 'descending']"
        :formatter="typeFormatter"
        label="权限"
        width="200"
        header-align="center"
        align="center"
      />
      <el-table-column align="right">
        <template slot="header" width="500">
          <el-input
            v-model="search"
            size="medium"
            placeholder="输入关键字搜索"
          />
        </template>
      </el-table-column>
      <el-table-column align="right" width="160">
        <template slot="header" slot-scope="scope">
          <el-button size="medium" :type="butType" @click="handleDeleteAll">{{
            butValue
          }}</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="info"
            @click="handleEdit(scope.$index, tableData)"
          >修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input
            v-model="form.usr_name"
            placeholder="请输入用户名"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth">
          <el-input
            v-model="form.usr_passwd"
            placeholder="请输入密码"
            show-password
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="用户权限" :label-width="formLabelWidth">
          <el-select v-model="form.usr_type" placeholder="请选择用户权限">
            <el-option label="超级管理员" value="0" />
            <el-option label="管理员" value="1" />
            <el-option label="普通用户" value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="determine">确 定</el-button>
      </div>
    </el-dialog>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      tableDatas: [
        {
          usr_guid: null,
          usr_name: null,
          usr_passwd: null,
          usr_type: null
        }
      ],
      tableData: null,
      loading: false,
      search: '',
      multipleSelection: [],
      form: {
        usr_guid: '',
        usr_name: '',
        usr_passwd: '',
        usr_type: null
      },
      butType: 'success',
      butValue: '添加用户',
      title: '修改',
      dialogTableVisible: false,
      dialogFormVisible: false,
      formLabelWidth: '80px',
      msg: null,
      currentPage: 1,
      pageSize: 10,
      pagerCount: 7,
      total: 0
    }
  },
  computed: {
    ...mapGetters({ eventlist: 'eventlist' })
  },
  watch: {
    eventlist: {
      handler: function(val, ordval) {
        if (val) {
          var msg = JSON.parse(val)
          if (msg.ord === 'req_get_usr_info_ret') {
            this.tableData = msg.usr_infos
            this.total = this.tableData.length
            this.paging()
          } else if (msg.ord === 'req_add_usr_ret') {
            this.msg = msg
            this.addcode()
          } else if (msg.ord === 'req_del_usr_ret') {
            this.msg = msg
            this.delcode()
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.sendUser()
  },
  methods: {
    tableRowClassName(row, column) {
      if (row.row.usr_state === 1) {
        return 'success-row'
      }
    },
    // 删除权限
    selectable(row, index) {
      if (row.usr_guid && row.usr_state < 1 && row.usr_type > 0) {
        return true
      } else {
        return false
      }
    },
    // 状态格式化
    stateFormatter(row, column) {
      if (row.usr_state === 1) {
        return '在线'
      } else {
        return '离线'
      }
    },
    // 权限格式化
    typeFormatter(row, column) {
      if (row.usr_type === '0') {
        return '超级管理员'
      } else if (row.usr_type === '1') {
        return '管理员'
      } else {
        return '普通用户'
      }
    },
    // 初始化请求全部数据
    sendUser() {
      const getUser = { ord: 'req_get_usr_info' }
      this.loading = true
      this.$store.dispatch('websocket/WEBSOCKET_REIVE', getUser)
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    // 判断是否选中数据
    handleSelectionChange(val) {
      this.multipleSelection = val
      if (this.multipleSelection.length) {
        this.butValue = '删除用户'
        this.butType = 'danger'
      } else {
        this.butValue = '添加用户'
        this.butType = 'success'
      }
    },
    // title变换
    handleEdit(index, data) {
      this.dialogFormVisible = true
      if (index !== null && data !== null) {
        this.title = '修改'
        this.form.name = data[index].name
      } else {
        this.title = '添加'
        this.form = {}
      }
    },
    // 通过判断是否选中了数据，来确定当前是否是删除还是添加用户
    handleDeleteAll() {
      if (this.butValue === '删除用户') {
        var user = {
          ord: 'req_batch_del_usr',
          usr_guids: []
        }
        for (var i = 0; i < this.multipleSelection.length; i++) {
          user.usr_guids.push(this.multipleSelection[i].usr_guid)
        }
        this.$store.dispatch('websocket/WEBSOCKET_REIVE', user).then(() => {
          // setTimeout(() => {
          // }, 1)
        })
        // this.tableData.splice(0, this.tableData.length)
      } else {
        this.handleEdit(null, null)
      }
    },
    S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    },
    // 生成guid
    guid() {
      return (
        this.S4() +
        this.S4() +
        '-' +
        this.S4() +
        '-' +
        this.S4() +
        '-' +
        this.S4() +
        '-' +
        this.S4() +
        this.S4() +
        this.S4()
      )
    },
    // 添加用户
    determine() {
      if (this.butValue === '添加用户') {
        this.loading = true
        var guid = new GUID()
        var radom = guid.newGUID()
        this.form.usr_guid = radom
        var addUser = {
          ord: 'req_add_usr',
          usr_info: {}
        }
        addUser.usr_info = this.form
        console.log(this.form.usr_guid)
        this.$store.dispatch('websocket/WEBSOCKET_REIVE', addUser).then(() => {
          // this.dialogFormVisible = false
          this.dialogFormVisible = false
        })
      }
    },
    // 判断添加用户是否成功
    addcode() {
      if (this.msg.code === 200) {
        console.log('from' + JSON.stringify(this.form))
        this.form.usr_state = -1
        this.tableData.push(this.form)
        this.total = this.tableData.length
        this.paging()
        this.$store.commit('websocket/WEBSOCKET_REIVE', '')
        this.loading = false
      } else {
        this.$store.commit('websocket/WEBSOCKET_REIVE', '')
        this.dialogFormVisible = false
        alert('添加失败！！！')
        this.loading = false
      }
    },
    // 判断删除用户是否成功
    delcode() {
      if (this.msg.code === 200) {
        const add = this.tableData.filter(
          item =>
            !this.multipleSelection.some(ele => ele.usr_guid === item.usr_guid)
        )
        this.tableData = add
        this.total = this.tableData.length
        this.paging()
        this.$store.commit('websocket/WEBSOCKET_REIVE', '')
      } else {
        alert('删除失败！！！')
        this.$store.commit('websocket/WEBSOCKET_REIVE', '')
      }
    },
    cancel() {
      this.dialogFormVisible = false
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
      this.tableDatas = this.tableData.slice(start, end)
    }
  }
}
class GUID {
  constructor() {
    this.date = new Date()

    /* 判断是否初始化过，如果初始化过以下代码，则以下代码将不再执行，实际中只执行一次 */
    if (typeof this.newGUID !== 'function') {
      /* 生成GUID码 */
      GUID.prototype.newGUID = function() {
        this.date = new Date()
        var guidStr = ''
        var sexadecimalDate = this.hexadecimal(this.getGUIDDate(), 16)
        var sexadecimalTime = this.hexadecimal(this.getGUIDTime(), 16)
        for (var i = 0; i < 9; i++) {
          guidStr += Math.floor(Math.random() * 16).toString(16)
        }
        guidStr += sexadecimalDate
        guidStr += sexadecimalTime
        while (guidStr.length < 32) {
          guidStr += Math.floor(Math.random() * 16).toString(16)
        }
        return this.formatGUID(guidStr)
      }
      /*
       * 功能：获取当前日期的GUID格式，即8位数的日期：19700101
       * 返回值：返回GUID日期格式的字条串
       */
      GUID.prototype.getGUIDDate = function() {
        return (
          this.date.getFullYear() +
          this.addZero(this.date.getMonth() + 1) +
          this.addZero(this.date.getDay())
        )
      }

      /*
       * 功能：获取当前时间的GUID格式，即8位数的时间，包括毫秒，毫秒为2位数：12300933
       * 返回值：返回GUID日期格式的字条串
       */
      GUID.prototype.getGUIDTime = function() {
        return (
          this.addZero(this.date.getHours()) +
          this.addZero(this.date.getMinutes()) +
          this.addZero(this.date.getSeconds()) +
          this.addZero(parseInt(this.date.getMilliseconds() / 10))
        )
      }

      /*
       * 功能: 为一位数的正整数前面添加0，如果是可以转成非NaN数字的字符串也可以实现
       * 参数: 参数表示准备再前面添加0的数字或可以转换成数字的字符串
       * 返回值: 如果符合条件，返回添加0后的字条串类型，否则返回自身的字符串
       */
      GUID.prototype.addZero = function(num) {
        if (Number(num).toString() !== 'NaN' && num >= 0 && num < 10) {
          return '0' + Math.floor(num)
        } else {
          return num.toString()
        }
      }

      /*
       * 功能：将y进制的数值，转换为x进制的数值
       * 参数：第1个参数表示欲转换的数值；第2个参数表示欲转换的进制；第3个参数可选，表示当前的进制数，如不写则为10
       * 返回值：返回转换后的字符串
       */
      GUID.prototype.hexadecimal = function(num, x, y) {
        if (y !== undefined) {
          return parseInt(num.toString(), y).toString(x)
        } else {
          return parseInt(num.toString()).toString(x)
        }
      }
      /*
       * 功能：格式化32位的字符串为GUID模式的字符串
       * 参数：第1个参数表示32位的字符串
       * 返回值：标准GUID格式的字符串
       */
      GUID.prototype.formatGUID = function(guidStr) {
        var str1 = guidStr.slice(0, 8) + '-'
        var str2 = guidStr.slice(8, 12) + '-'
        var str3 = guidStr.slice(12, 16) + '-'
        var str4 = guidStr.slice(16, 20) + '-'
        var str5 = guidStr.slice(20)
        return str1 + str2 + str3 + str4 + str5
      }
    }
  }
}
</script>
<style>
.el-table .warning-row {
  background: rgb(211, 211, 209);
}

.el-table .success-row {
  background: #ddf1d2;
}

.paging {
  padding-top: 15px;
}
</style>
