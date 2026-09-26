---
title: "芯动力——高质量Verilog设计"
date: 2022-12-03T13:06:07.000Z
updated: 2022-12-22T07:38:36.727Z
author: "xuaner"
categories:
  - ["数字IC"]
tags:
  - "数字IC"
  - "Verilog"
---

<h2 id="高质量verilog设计">高质量verilog设计</h2><p>可综合语句</p>
<ul>
<li>always</li>
<li>if-else</li>
<li>case</li>
<li>assign</li>
</ul>
<h3 id="if语句">if语句</h3><p><img src="/images/BlogImg/202212032046854.jpg" alt="if语句"><code>if-else</code>语句映射为多路选择器</p>
<p>不同的<code>if-else</code>结构会导致不同的电路结构，根据约束不同，设计：先加法器后选择器；先选择器后加法器</p>
<p>加法器的面积比选择器大，但是先加法器后选择器的延时小。</p>
<p><img src="/images/BlogImg/202212032047446.jpg" alt="if-else"></p>
<p>单独的<code>if-else</code>语句没有优先级，会逐一检查，多个<code>if</code>语句之间具有优先级，多个选择器之间级联，最后一级具有最高优先级。</p>
<p><img src="/images/BlogImg/202212032047060.jpg" alt="多if语句"></p>
<blockquote>
<p>若某些设计中，有些信号要求先到达（如关键使能信号、选择信号等），而有些信号需要后到达（如慢速信号、有效时间较长的信号等），此时侧需要使用if…if…结构。<br>设计方法：最高优先级给最迟到达的关键信号</p>
</blockquote>
<h3 id="case语句">case语句</h3><p><code>case</code>和单<code>if</code>语句类似，但是<code>case</code>语句互斥</p>
<p><code>case</code>的使用注意点：</p>
<ol>
<li>要在<code>always</code>块里使用，如果是用<code>always</code>块描述组合逻辑，注意括号里的敏感变量列表都是电平触发，并且赋值时都要用阻塞赋值“&#x3D;”：</li>
<li><code>always</code>块里的变量必须声明成reg类型，当然声明成<code>reg</code>类型不代表一定会综合成寄存器，只是语法要求<code>always</code>块里要这样；</li>
<li><code>always</code>：块描述组合逻辑时，用<code>*</code>可以代表所有<code>always</code>块内敏感信号；</li>
<li>分支条件要写全，最好补齐<code>default</code>缺省条件，不然在组合逻辑中可能会由于条件不全导致出现锁存器<code>Latch</code>；</li>
</ol>
<h3 id="Latch语句">Latch语句</h3><p>综合工具很难解释<code>Latch</code></p>
<ul>
<li><code>latch</code>由电平触发，非同步控制。在使能信号有效时<code>latch</code>相当于通路，在使能信号无效时<code>latch</code>保持输出状态。<code>DFF</code>由时钟沿触发同步制。</li>
<li><code>latch</code>容易产生毛刺，<code>DFF</code>则不易产生毛刺。</li>
<li><code>latch</code>将静态时序分析变得极为复杂。</li>
</ul>
<p><code>Latch</code>容易在不完备的<code>if-else</code>和<code>case</code>中产生</p>
<ol>
<li><p>使用完备<code>if-else</code>语句</p>
</li>
<li><p>使用<code>default</code>覆盖<code>case</code>语句</p>
</li>
<li><p>查看综合工具的<code>warning</code>信息</p>
</li>
<li><p>使用<code>full_case</code>，告诉综合工具<code>case</code>已经完备</p>
<p><img src="/images/BlogImg/202212032048386.jpg" alt="full_case"></p>
</li>
<li><p>使用<code>parallel_case</code>，告诉综合工具，所有条件互斥且并行，没有优先权</p>
<p><img src="/images/BlogImg/202212032049340.jpg" alt="parallel_case"></p>
</li>
</ol>
<h3 id="资源重复利用">资源重复利用</h3><p>负载均衡、逻辑复制</p>
<p><img src="/images/BlogImg/202212032051244.jpg" alt="负载均衡、逻辑复制"></p>
<p>资源共享、减小面积</p>
<p><img src="/images/BlogImg/202212032052083.jpg" alt="资源共享、减小面积"></p>
<p>顺序重排、降低延时</p>
<p><img src="/images/BlogImg/202212032052317.jpg" alt="顺序重排、降低延时"></p>
<h3 id="赋值语句">赋值语句</h3><p>关于<code>assign</code>：</p>
<ul>
<li>仅用于信号连接</li>
<li>难以阅读，且多层嵌套后很难被综合器解释</li>
</ul>
<h3 id="可综合风格">可综合风格</h3><p><code>always</code>敏感信号表</p>
<ul>
<li>所有的组合逻辑或锁存的<code>always</code>结构必须有敏感信号列表。这个敏感信号列表必须包含所有的输入信号。</li>
<li>综合过程将产生一个取决于除敏感列表中所有其它值的结构，它将可能在行为仿真和门级仿真间产生潜在的失配。</li>
<li>在综合过程中，每个<code>Verilog always</code>敏感信号列表只能对应一个时钟。</li>
<li>这是将每一个过程限制在单一寄存器类型的要求。</li>
</ul>
<p><code>wait</code>和<code>delay</code>不能用于可综合<code>RTL</code>设计</p>
<ul>
<li>原因：从<code>RTL</code>级转换到<code>gate</code>级的综合工具一般都不支持<code>Wait</code>声明和<code>#delay</code>声明，为了有效的综合，这些语句应该避免。</li>
<li>例外：在不需要行综合的行为模块中，如测试模块<code>Testbench</code>、表示行为的虚拟器件模块中可以使用。</li>
</ul>
<p>非阻塞赋值和阻塞赋值</p>
<ul>
<li>在时序电路中必须使用非阻塞赋值<code>&lt;=</code></li>
<li>组合逻辑电路必须使用阻塞赋值<code>=</code></li>
</ul>
<p>异步逻辑和同步逻辑</p>
<ul>
<li>建议分开异步逻辑与同步逻辑</li>
<li>避免综合时的问题，简化约束和编码难度。</li>
<li>不可应用于非综合模块中（例如：总线模块，总线监视器或是模拟模块）除非他们被设计来综合仿真。</li>
</ul>
<p>控制逻辑和存储器</p>
<ul>
<li>建议控制逻辑和存储器逻辑分成独立的模块</li>
<li>便于高层的存储器模块的使用和便于重新描述为不同的存储器类型</li>
</ul>
<p>优秀的设计</p>
<ul>
<li>牢记并理解可综合“四大法宝”所对应的硬件结构</li>
<li>写前确认电路指标是什么：性能？面积？</li>
<li>硬件思维方式，代码不再是一行行的代码而是一块一块的硬件模块</li>
<li>对所需实现的硬件电路“胸有成竹”，有足够的数电基础</li>
</ul>
<h2 id="降低延时">降低延时</h2><p>尽可能将延时高的模块放在后面</p>
<h3 id="RTL编码面积">RTL编码面积</h3><p>减小设计面积：</p>
<ul>
<li>成本降低、功耗降低</li>
<li>特别是对于<code>FPGA</code>的设计，直接决着<code>FPGA</code>的选型</li>
<li>估计设计使用资源的数量，知道设计中哪些部分占用了较大的面积</li>
</ul>
<p>触发器的数量有功能决定，很难减少，面积则很好估计</p>
<p>组合逻辑—》<code>RTL</code>代码—》各种操作符</p>
<p>必须使用复杂运算符，需要考虑能否使用资源共享。</p>
<p>多比特操作，应该看一看这个信号的所有比特是否都需要参与操作，如果不是则可以只对需要的部分比特进行操作。</p>
<p><img src="/images/BlogImg/202212062019510.jpg" alt="多比特操作"></p>
<p><code>addr&lt;=addr+32;</code>—》<code>addr[7:5]&lt;=addr[7:5]+1;</code> <code>addr[4:0]&lt;=addr[4:0]+0;</code></p>
<h3 id="RTL编码功耗">RTL编码功耗</h3><p>$$<br>p_d&#x3D;∑afCV^2<br>$$</p>
<p>p<del>d</del>是电路割点功耗总和，a是该点电路翻转次数，f是电路工作频率，C是该点电容，V表示电压值</p>
<p><code>RTL</code>无法改变负载电容、工作电压，只能考虑尽可能降低电路翻转频率</p>
<p>主要措施：</p>
<ul>
<li>门控时钟</li>
<li>增加使能信号，使得部分电路只有在需要工作时才工作；</li>
<li>对芯片各个模块进行控制，在需要工作时才工作；</li>
<li>除了有用信号和时钟的翻转会消耗功耗组合逻辑产生的毛刺也会大量消耗功耗。<br>但是，毛刺在设计中无法避免，因此，只有尽量减少毛刺在电路中的传播，才可以减少功耗。<br>即，在设计中，尽量把产生毛刺的电路放在传播路径的最后。另外，可以使用一些减少毛刺的技术。</li>
</ul>
<p></p>
<h3 id="RTL编码布线">RTL编码布线</h3><ul>
<li>但即使使用最好的布局工具，还是可能出现无法布通的情况。</li>
<li>如果可以在<code>RTL</code>编码阶段考虑代码可能对布线产生的影响就可能避免最后出现无法布通的情况</li>
</ul>
<h2 id="RTL设计指导原则">RTL设计指导原则</h2><p>指导原则：</p>
<ol>
<li>面积与速度互换</li>
<li>乒乓操作</li>
<li>流水线设计</li>
</ol>
