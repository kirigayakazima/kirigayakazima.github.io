---
title: "FreeRTOS-08-内存管理"
date: 2023-07-12T01:42:21.000Z
updated: 2023-07-12T01:42:51.197Z
author: "xuaner"
categories:
  - ["单片机"]
tags:
  - "STM32"
---

<h2 id="内存管理">内存管理</h2><p>内存通常分为两种：内部存储空间（<code>RAM</code>）和外部存储空间（硬盘）</p>
<p>避免使用<code>C</code>语言标准库的<code>malloc</code>和<code>free</code>内存函数</p>
<ol>
<li>嵌入式<code>RAM</code>可能不足，函数并不总是可用</li>
<li>实现可能很大，占用很大的代码空间</li>
<li>几乎不安全</li>
<li>调用时间不确定，每次可能都不一样</li>
<li>可能产生碎片</li>
<li>会使链接器配置复杂</li>
<li>如果允许堆空间的生长方向覆盖其他变量占据的内存，会成为<code>debug</code>的灾难</li>
</ol>
<h3 id="内存管理应用场景">内存管理应用场景</h3><ol>
<li><code>void *pvPortMalloc(size_t xSize)</code>申请内存</li>
<li><code>void vPortFree(void *pv)</code>释放内存</li>
<li><code>void vPortInitialiseBlocks(void)</code>初始化内存堆</li>
<li><code>size_t xPortGetFreeHeapSize(void)</code>获取当前未分配的内存堆大小</li>
<li><code>size_t xPortGetMinimumEverFreeHeapSize(void)</code>获取未分配的内存堆历史最小值</li>
<li><code>heap_1.c</code>、<code>heap_2.c</code>、<code>heap_4.c</code>内存堆是一个很大的数组</li>
<li><code>heap_3.c</code>是使用<code>C</code>语言原生的<code>malloc</code>和<code>free</code>函数，但是进行的安全保护的封装，需要用户通过编译器或者启动文件设置空间</li>
<li><code>heap_5.c</code>允许用户使用多个非连续的内存堆空间，同时可以使用外部SDRAM、内存卡等</li>
</ol>
<h3 id="heap-1">heap_1</h3><ol>
<li>用于从不删除任务、队列、信号量、互斥量等应用程序</li>
<li>函数执行时间是确定并且不会产生内存碎片</li>
<li>不支持释放内存</li>
</ol>
<h3 id="heap-2">heap_2</h3><ol>
<li>和<code>heap_1</code>的内存管理算法不同，采用最佳匹配算法，支持释放内存不能将相邻的小碎片内存合并为大内存</li>
<li>可用于反复删除任务、队列、信号量、互斥量等内核对象且不担心内存碎片的应用程序</li>
<li>若存在一些碎片化的任务，那么可能导致内存碎片</li>
<li>具有不确定性，但是比<code>C</code>语言原生的<code>malloc</code>高级</li>
<li>不能用于内存分配和释放是随机大小的应用程序</li>
</ol>
<h3 id="heap-3">heap_3</h3><ol>
<li>简单封装<code>C</code>语言的<code>malloc</code>和<code>free</code>，满足常用的编译器，具有保护功能</li>
<li>需要链接器设置一个堆，<code>malloc</code>和<code>free</code>由编译器提供</li>
<li>具有不确定性</li>
<li>很可能增大<code>RTOS</code>内核代码大小</li>
<li><code>configTOTAL_HEAP_SIZE</code>宏定义不起作用</li>
</ol>
<h3 id="heap-4">heap_4</h3><ol>
<li>在<code>heap_2</code>的基础上加上了合并算法，能将相邻空闲内存合并为1个更大的块</li>
<li>可用于重复删除任务、队列、信号量、互斥量等的应用程序</li>
<li>可用于分配和释放随机字节内存的应用程序，但并不像<code>heap_2</code>那样产生严重的内存碎片</li>
<li>具有不确定性，但是效率比<code>C</code>语言原生的<code>malloc</code>函数高</li>
</ol>
<h3 id="heap-5">heap_5</h3><ol>
<li>动态分配和<code>heap_4</code>是一样，采用最佳匹配和合并算法，并且允许内存跨多个非连续内存区</li>
<li>需要使用<code>vPortDefineHeapRegions()</code>来实现内存初始化</li>
</ol>
<h3 id="创建内存管理">创建内存管理</h3><blockquote>
<p>内存管理句柄，创建一个引用，并不是创建一个真实的内存管理</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//内存管理</span></span><br><span class="line"><span class="type">static</span> TaskHandle_t Test_Task_Handle=<span class="literal">NULL</span>;</span><br><span class="line"></span><br><span class="line"><span class="type">uint8_t</span> *Test_Ptr=<span class="literal">NULL</span>;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>Test任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br><span class="line">30</span><br><span class="line">31</span><br><span class="line">32</span><br><span class="line">33</span><br><span class="line">34</span><br><span class="line">35</span><br><span class="line">36</span><br><span class="line">37</span><br><span class="line">38</span><br><span class="line">39</span><br><span class="line">40</span><br><span class="line">41</span><br><span class="line">42</span><br><span class="line">43</span><br><span class="line">44</span><br><span class="line">45</span><br><span class="line">46</span><br><span class="line">47</span><br><span class="line">48</span><br><span class="line">49</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//内存管理</span></span><br><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Test_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	<span class="type">uint32_t</span> g_memsize;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="keyword">if</span> (Key_BTN(BTN1)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="keyword">if</span> (Test_Ptr==<span class="literal">NULL</span>)</span><br><span class="line">			&#123;</span><br><span class="line">				<span class="comment">//获取当前内存大小</span></span><br><span class="line">				g_memsize=xPortGetFreeHeapSize();</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;系统当前内存大小为%d字节，开始申请内存\r\n&quot;</span>,g_memsize);</span><br><span class="line">				Test_Ptr = pvPortMalloc(<span class="number">1024</span>);</span><br><span class="line">				<span class="keyword">if</span> (Test_Ptr!=<span class="literal">NULL</span>)</span><br><span class="line">				&#123;</span><br><span class="line">					<span class="built_in">printf</span>(<span class="string">&quot;内存申请成功\r\n&quot;</span>);</span><br><span class="line">					<span class="built_in">printf</span>(<span class="string">&quot;申请到的内存地址为%#x\r\n&quot;</span>,(<span class="type">int</span>)Test_Ptr);</span><br><span class="line">					<span class="comment">// 当前剩余内存大小</span></span><br><span class="line">					g_memsize = xPortGetFreeHeapSize();</span><br><span class="line">					<span class="built_in">printf</span>(<span class="string">&quot;系统当前内存剩余大小为%d字节\r\n&quot;</span>,g_memsize);</span><br><span class="line"></span><br><span class="line">					<span class="built_in">sprintf</span>((<span class="type">char</span>*)Test_Ptr,<span class="string">&quot;当前系统TickCount=%d\r\n&quot;</span>,xTaskGetTickCount);</span><br><span class="line">					<span class="built_in">printf</span>(<span class="string">&quot;写入数据是%s\r\n&quot;</span>,(<span class="type">char</span>*)Test_Ptr);</span><br><span class="line">				&#125;<span class="keyword">else</span></span><br><span class="line">				&#123;</span><br><span class="line">					<span class="built_in">printf</span>(<span class="string">&quot;按下Key2释放内存然后申请\r\n&quot;</span>);</span><br><span class="line">				&#125;</span><br><span class="line">			&#125;</span><br><span class="line">		&#125;</span><br><span class="line">		<span class="keyword">if</span> (Key_BTN(BTN2)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="keyword">if</span> (Test_Ptr!=<span class="literal">NULL</span>)</span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;释放内存\r\n&quot;</span>);</span><br><span class="line">				vPortFree(Test_Ptr);</span><br><span class="line">				Test_Ptr=<span class="literal">NULL</span>;</span><br><span class="line">				<span class="comment">// 获取当前剩余内存</span></span><br><span class="line">				g_memsize = xPortGetFreeHeapSize();</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;系统当前内存剩余大小为%d字节\r\n&quot;</span>,g_memsize);</span><br><span class="line">			&#125;<span class="keyword">else</span></span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;按下Key1申请内存再释放\r\n&quot;</span>);</span><br><span class="line">			&#125;</span><br><span class="line">	</span><br><span class="line">		&#125;</span><br><span class="line">		vTaskDelay(<span class="number">20</span>);</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>按下<code>BTN1</code>申请内存，并将系统当前<code>TickCount</code>打印，按下<code>BTN2</code>释放内存</p>
</blockquote>
<p></p>
