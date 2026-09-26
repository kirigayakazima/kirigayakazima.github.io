---
title: "FreeRTOS-04-信号量"
date: 2023-07-02T13:49:30.000Z
updated: 2023-07-03T13:19:02.534Z
author: "xuaner"
categories:
  - ["单片机"]
tags:
  - "STM32"
---

<h2 id="信号量">信号量</h2><p>信号量类似于裸机开发中的标志位，用于任务间通信的变量，或者成为标志位。</p>
<p>临界资源：任何时刻只能被一个任务访问的资源</p>
<p>递归信号量和互斥量都实现继承优先级机制，降低优先级反转的危害</p>
<h3 id="二值信号量运行机制">二值信号量运行机制</h3><ol>
<li>类似于互斥量，但是没有互斥量的优先级继承机制</li>
<li>偏向于同步功能，任务与任务的同步，任务与中断的同步</li>
<li>等效于一个只有一个消息的队列，只存在两种状态：有消息或者无消息</li>
<li>信号被获取时为0，被释放时为1</li>
<li>二值信号量无效时，有其他任务获取信号量，则任务进入阻塞态</li>
</ol>
<p><img src="/images/BlogImg/202307021107006.png"></p>
<ol start="6">
<li>某时刻信号量被中断或任务释放时，其他进入阻塞态的最高优先级任务进入就绪态</li>
</ol>
<p><img src="/images/BlogImg/202307021109619.png"></p>
<p></p>
<h3 id="计数信号量运行机制">计数信号量运行机制</h3><figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//使用计数信号量需要开启宏定义</span></span><br><span class="line"><span class="comment">//开启计数信号量</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_COUNTING_SEMAPHORES   1</span></span><br></pre></td></tr></table></figure>

<ol>
<li>当事件发生时，信号量被释放，计数值加一</li>
<li>当事件被处理时，信号量被取走，计数值减一</li>
<li>信号计数值表示还未处理事件数量</li>
<li>使用完资源必须返还信号量，信号量为0时表示无资源可用</li>
<li>可用于资源管理，允许多个任务获取信号量进行资源访问，当访问个数到达最大时，其他任务进入阻塞态，直到有任务释放资源，类似于二值信号量访问资源的过程</li>
</ol>
<p><img src="/images/BlogImg/202307021113175.png"></p>
<h3 id="互斥信号量运行机制">互斥信号量运行机制</h3><figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//使用互斥信号量需要开启宏定义</span></span><br><span class="line"><span class="comment">//开启互斥量</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_MUTEXES 1</span></span><br><span class="line"><span class="comment">//开启递归互斥量</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_RECURSIVE_MUTEXES 1</span></span><br></pre></td></tr></table></figure>

<ol>
<li>特殊的二值信号量，拥有优先级继承机制</li>
<li>信号量创建之初为满，使用临界资源时，先获取信号量使其为空，防止其他任务使用临界资源。</li>
<li>低优先级任务申请互斥量，高优先级任务申请不到进入阻塞态，低优先级任务临时继承高优先级的优先级。</li>
</ol>
<p><img src="/images/BlogImg/202307021729397.png"></p>
<ol start="4">
<li>适用于可能引发优先级翻转的场景</li>
<li>可递归使用，形成递归互斥量，任务可能会多次获取互斥量的情况下。这样可以避免同一任务多次递归持有而造成死锁的问题。</li>
<li>互斥量不能在中断使用，优先级继承只在普通任务中有效，同一时期只能有一个任务获取互斥量进行资源访问</li>
</ol>
<p><img src="/images/BlogImg/202307021739505.png"></p>
<h3 id="递归信号量运行机制">递归信号量运行机制</h3><ol>
<li>获取递归信号量的任务可以重复获取该量，拥有该量的所有权</li>
<li>递归几次就要返还几次，有点类似任务的挂起和恢复之间的关系</li>
</ol>
<p></p>
<h3 id="信号常见函数">信号常见函数</h3><ol>
<li><code>xSemaphoreCreateBinary()</code>创建二值信号量，返回一个句柄，函数原型<code>xQueueGenericCreate()</code></li>
<li><code>xSemaphoreCreateCounting()</code>创建计数信号量，返回一个句柄，原型<code>xQueueGenericCreate()</code></li>
<li><code>xSemaphoreGive()</code>释放信号量，可用于二值信号量、互斥信号量、计数信号量的任务释放，不能用于递归信号量，原型<code>xQueueGenericSend()</code></li>
<li><code>xSemaphoreGiveFromISR()</code>用于中断的释放信号量，只能用于二值信号量、计数信号量，原型<code>xQueueGiveFromISR()</code></li>
<li><code>xSemaphoreTake()</code>获取信号量，可用于二值信号量、互斥信号量、计数信号量的任务获取，不能用于递归信号量，原型<code>xQueueGenericReceive()</code>，该操作类似任务访问队列消息的过程。</li>
<li><code>xSemaphoreTakeFromISR()</code>，用于中断的获取信号量，只能用于二值信号量、计数信号量</li>
<li><code>xSemaphoreCreateMutex()</code>创建互斥量，返回一个句柄，只能被同一个任务获取，再次获取会失败。原型<code>xQueueCreateMutex()</code>，原型的原型为<code>xQueueGenericCreate()</code></li>
<li><code>prvInitialiseMutex()</code>初始化互斥量</li>
<li><code>xSemaphoreCreateRecursiveMutex()</code>创建递归互斥量，可以被同一个任务获取很多次，获取前先释放。原型<code>xQueueCreateMutex()</code></li>
<li><code>xSemaphoreDelete()</code>信号量删除</li>
<li><code>xSemaphoreTakeRecursive()</code>获取递归互斥量，原型<code>xQueueTakeMutexRecursive()</code>，该函数不能获取由<code>xSemaphoreCreateMutex()</code>创建的互斥量</li>
<li><code>xSemaphoreGiveRecursive()</code>释放递归互斥量，原型<code>xQueueGiveMutexRecursive()</code></li>
</ol>
<h3 id="创建二值信号量">创建二值信号量</h3><p>设计1个<code>Button</code>任务，通过按键发送控制<code>LED0</code>的开关，二值量操作信息通过串口显示</p>
<blockquote>
<p>二值量句柄，创建一个引用，并不是创建一个真实的二值量</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//创建一个二值信号量句柄</span></span><br><span class="line">SemaphoreHandle_t Binary_Handle=<span class="literal">NULL</span>;</span><br><span class="line"><span class="comment">//发送和接收任务-信号量</span></span><br><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Receive_Semaph_Task</span><span class="params">(<span class="type">void</span> *paramter)</span>;</span><br><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Send_Semaph_Task</span><span class="params">(<span class="type">void</span> *paramter)</span>;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>创建一个真实的二值量</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//创建一个二值信号量</span></span><br><span class="line">Binary_Handle = xSemaphoreCreateBinary();</span><br></pre></td></tr></table></figure>

<blockquote>
<p>接收数据任务控制LED0</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Receive_Semaph_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	BaseType_t xReturn=pdPASS;</span><br><span class="line">	<span class="type">uint32_t</span> r_queue;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="comment">//获取二值信号量</span></span><br><span class="line">		xReturn = xSemaphoreTake(Binary_Handle,portMAX_DELAY);</span><br><span class="line">		<span class="keyword">if</span>(xReturn==pdPASS)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;二值信号量获取成功\r\n&quot;</span>);</span><br><span class="line">		&#125;</span><br><span class="line">		LED0_Turn();</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>Button控制发送数据任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br><span class="line">30</span><br><span class="line">31</span><br><span class="line">32</span><br><span class="line">33</span><br><span class="line">34</span><br><span class="line">35</span><br><span class="line">36</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Send_Semaph_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	BaseType_t xReturn=pdTRUE;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="keyword">if</span> (Key_BTN(BTN1)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="comment">//先释放一下二值信号量</span></span><br><span class="line">			xReturn = xSemaphoreGive(Binary_Handle);</span><br><span class="line">			<span class="keyword">if</span> (xReturn==pdTRUE)</span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;二值信号量释放成功\r\n&quot;</span>);</span><br><span class="line">			&#125;<span class="keyword">else</span></span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;二值信号量释放失败\r\n&quot;</span>);</span><br><span class="line">			&#125;</span><br><span class="line">		&#125;</span><br><span class="line"></span><br><span class="line">		<span class="keyword">if</span> (Key_BTN(BTN2)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="comment">//先释放一下二值信号量</span></span><br><span class="line">			xReturn = xSemaphoreGive(Binary_Handle);</span><br><span class="line">			<span class="keyword">if</span> (xReturn==pdTRUE)</span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;二值信号量释放成功\r\n&quot;</span>);</span><br><span class="line">			&#125;<span class="keyword">else</span></span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;二值信号量释放失败\r\n&quot;</span>);</span><br><span class="line">			&#125;</span><br><span class="line">		&#125;</span><br><span class="line">	</span><br><span class="line">		vTaskDelay(<span class="number">20</span>);</span><br><span class="line">	</span><br><span class="line">	&#125;</span><br><span class="line"></span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<h3 id="创建计数二值量">创建计数二值量</h3><p>设计2个<code>Button</code>任务，通过按键<code>BTN1</code>申请车位，按键<code>BTN2</code>释放车位，最大车位5</p>
<blockquote>
<p>开启宏定义</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//开启计数信号量</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_COUNTING_SEMAPHORES   1</span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>计数信号量句柄，创建一个引用，并不是创建一个真实的计数信号量</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//创建一个计数信号量句柄</span></span><br><span class="line">SemaphoreHandle_t CountSem_Handle=<span class="literal">NULL</span>;</span><br><span class="line"><span class="comment">//计数信号量-申请释放车位</span></span><br><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Take_Task</span><span class="params">(<span class="type">void</span> *paramter)</span>;</span><br><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Give_Task</span><span class="params">(<span class="type">void</span> *paramter)</span>;</span><br><span class="line"><span class="comment">//计数信号量-申请释放车位任务句柄</span></span><br><span class="line"><span class="type">static</span> TaskHandle_t Take_Task_Handle=<span class="literal">NULL</span>;</span><br><span class="line"><span class="type">static</span> TaskHandle_t Give_Task_Handle=<span class="literal">NULL</span>;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>创建一个真实的计数信号量</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//创建一个计数信号量</span></span><br><span class="line">CountSem_Handle =xSemaphoreCreateCounting(<span class="number">5</span>,	<span class="comment">//最大车位5</span></span><br><span class="line">					<span class="number">5</span>);	<span class="comment">//当前空闲车位5</span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>BTN1控制申请车位</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Take_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	BaseType_t xReturn=pdTRUE;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="keyword">if</span> (Key_BTN(BTN1)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="comment">//获取计数信号量</span></span><br><span class="line">			xReturn = xSemaphoreTake(CountSem_Handle,</span><br><span class="line">						<span class="number">0</span>);		<span class="comment">//等待时间：0</span></span><br><span class="line">			<span class="keyword">if</span> (xReturn==pdTRUE)</span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;BTN1按下，申请车位成功\r\n&quot;</span>);</span><br><span class="line">			&#125;<span class="keyword">else</span></span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;BTN1按下，车位已满，申请车位失败\r\n&quot;</span>);</span><br><span class="line">			&#125;</span><br><span class="line">		&#125;</span><br><span class="line">		vTaskDelay(<span class="number">20</span>);</span><br><span class="line"></span><br><span class="line">	&#125;</span><br><span class="line"></span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>BTN2释放车位</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Give_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	BaseType_t xReturn=pdTRUE;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="keyword">if</span> (Key_BTN(BTN2)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="comment">//获取计数信号量</span></span><br><span class="line">			xReturn = xSemaphoreGive(CountSem_Handle);	</span><br><span class="line">			<span class="keyword">if</span> (xReturn==pdTRUE)</span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;BTN2按下，释放一个车位\r\n&quot;</span>);</span><br><span class="line">			&#125;<span class="keyword">else</span></span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;BTN2按下，无车位可被释放\r\n&quot;</span>);</span><br><span class="line">			&#125;</span><br><span class="line">		&#125;</span><br><span class="line">		vTaskDelay(<span class="number">20</span>);</span><br><span class="line">	</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<h3 id="创建二值信号量优先级翻转">创建二值信号量优先级翻转</h3><p>创建<code>Low</code>、<code>Mid</code>、<code>High</code>三个任务，其中<code>Low</code>获取信号后，被<code>Mid</code>打断，但是<code>Mid</code>未执行完，执行完后，<code>Low</code>释放信号后，<code>High</code>才能获取信号，在此之前<code>High</code>进入阻塞态。</p>
<blockquote>
<p>二值信号量句柄，创建一个引用，并不是创建一个真实的二值信号量</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//优先级翻转</span></span><br><span class="line"><span class="type">static</span> TaskHandle_t LowPriority_Task_Handle=<span class="literal">NULL</span>;</span><br><span class="line"><span class="type">static</span> TaskHandle_t MidPriority_Task_Handle=<span class="literal">NULL</span>;</span><br><span class="line"><span class="type">static</span> TaskHandle_t HighPriority_Task_Handle=<span class="literal">NULL</span>;</span><br><span class="line"></span><br><span class="line"><span class="comment">//创建一个二值信号量句柄</span></span><br><span class="line">SemaphoreHandle_t Binary_Handle=<span class="literal">NULL</span>;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>创建一个真实的二值量</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//创建一个二值信号量</span></span><br><span class="line">Binary_Handle = xSemaphoreCreateBinary();</span><br></pre></td></tr></table></figure>

<blockquote>
<p>Low任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">LowPriority_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	<span class="type">static</span> <span class="type">uint32_t</span> i;</span><br><span class="line">	BaseType_t xReturn=pdPASS;</span><br><span class="line"></span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="built_in">printf</span>(<span class="string">&quot;Low任务获取二值信号量\r\n&quot;</span>);</span><br><span class="line">		xReturn = xSemaphoreTake(Binary_Handle,portMAX_DELAY);</span><br><span class="line">		<span class="keyword">if</span>(xReturn==pdPASS)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;Low任务获取成功\r\n&quot;</span>);</span><br><span class="line">		&#125;</span><br><span class="line">		<span class="keyword">for</span> ( i = <span class="number">0</span>; i &lt; <span class="number">2000000</span>; i++)	<span class="comment">//模拟占用</span></span><br><span class="line">		&#123;</span><br><span class="line">			taskYIELD();	<span class="comment">//发起任务调度</span></span><br><span class="line">		&#125;</span><br><span class="line"></span><br><span class="line">		<span class="built_in">printf</span>(<span class="string">&quot;Low任务释放二值信号量\r\n&quot;</span>);</span><br><span class="line">		xReturn = xSemaphoreGive(Binary_Handle);</span><br><span class="line"></span><br><span class="line">		LED0_Turn();</span><br><span class="line">		vTaskDelay(<span class="number">500</span>);</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>Mid任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">MidPriority_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="built_in">printf</span>(<span class="string">&quot;Mid任务运行中\r\n&quot;</span>);</span><br><span class="line">		vTaskDelay(<span class="number">500</span>);</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>High任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">HighPriority_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	BaseType_t xReturn = pdTRUE;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="built_in">printf</span>(<span class="string">&quot;High任务获取二值信号量\r\n&quot;</span>);</span><br><span class="line">		xReturn = xSemaphoreTake(Binary_Handle,portMAX_DELAY);</span><br><span class="line"></span><br><span class="line">		<span class="keyword">if</span> (xReturn==pdTRUE)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;High任务获取成功\r\n&quot;</span>);</span><br><span class="line">		&#125;</span><br><span class="line"></span><br><span class="line">		LED0_Turn();</span><br><span class="line">		xReturn = xSemaphoreGive(Binary_Handle);</span><br><span class="line">		vTaskDelay(<span class="number">500</span>);</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>注意调整<code>AppTaskCreate</code>中的优先级顺序</p>
</blockquote>
<h3 id="创建互斥量">创建互斥量</h3><blockquote>
<p>开启宏定义</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//开启互斥量</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_MUTEXES 1</span></span><br><span class="line"><span class="comment">//开启递归互斥量</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_RECURSIVE_MUTEXES 1</span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>互斥句柄，创建一个引用，并不是创建一个真实的互斥</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//优先级翻转</span></span><br><span class="line"><span class="type">static</span> TaskHandle_t LowPriority_Task_Handle=<span class="literal">NULL</span>;</span><br><span class="line"><span class="type">static</span> TaskHandle_t MidPriority_Task_Handle=<span class="literal">NULL</span>;</span><br><span class="line"><span class="type">static</span> TaskHandle_t HighPriority_Task_Handle=<span class="literal">NULL</span>;</span><br><span class="line"></span><br><span class="line"><span class="comment">//创建互斥量句柄</span></span><br><span class="line">SemaphoreHandle_t MutexSem_Handle=<span class="literal">NULL</span>;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>创建一个真实的互斥量</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//创建互斥量</span></span><br><span class="line">MutexSem_Handle = xSemaphoreCreateMutex();</span><br></pre></td></tr></table></figure>

<blockquote>
<p>Low任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">LowPriority_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	<span class="type">static</span> <span class="type">uint32_t</span> i;</span><br><span class="line">	BaseType_t xReturn=pdPASS;</span><br><span class="line"></span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="built_in">printf</span>(<span class="string">&quot;Low任务获取互斥量\r\n&quot;</span>);</span><br><span class="line">		xReturn = xSemaphoreTake(MutexSem_Handle,portMAX_DELAY);</span><br><span class="line">		<span class="keyword">if</span>(xReturn==pdPASS)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;Low任务获取成功\r\n&quot;</span>);</span><br><span class="line">		&#125;</span><br><span class="line">		<span class="keyword">for</span> ( i = <span class="number">0</span>; i &lt; <span class="number">2000000</span>; i++)	<span class="comment">//模拟占用</span></span><br><span class="line">		&#123;</span><br><span class="line">			taskYIELD();	<span class="comment">//发起任务调度</span></span><br><span class="line">		&#125;</span><br><span class="line"></span><br><span class="line">		<span class="built_in">printf</span>(<span class="string">&quot;Low任务释放互斥量\r\n&quot;</span>);</span><br><span class="line">		xReturn = xSemaphoreGive(MutexSem_Handle);</span><br><span class="line"></span><br><span class="line">		LED0_Turn();</span><br><span class="line">		vTaskDelay(<span class="number">1000</span>);</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>Mid任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">MidPriority_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="built_in">printf</span>(<span class="string">&quot;Mid任务运行中\r\n&quot;</span>);</span><br><span class="line">		vTaskDelay(<span class="number">500</span>);</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>High任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">HighPriority_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	BaseType_t xReturn = pdTRUE;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="built_in">printf</span>(<span class="string">&quot;High任务获取互斥量\r\n&quot;</span>);</span><br><span class="line">		xReturn = xSemaphoreTake(MutexSem_Handle,portMAX_DELAY);</span><br><span class="line"></span><br><span class="line">		<span class="keyword">if</span> (xReturn==pdTRUE)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;High任务获取成功\r\n&quot;</span>);</span><br><span class="line">		&#125;</span><br><span class="line"></span><br><span class="line">		LED0_Turn();</span><br><span class="line">		<span class="built_in">printf</span>(<span class="string">&quot;High释放互斥量\r\n&quot;</span>);</span><br><span class="line">		xReturn = xSemaphoreGive(MutexSem_Handle);</span><br><span class="line">		vTaskDelay(<span class="number">1000</span>);</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>注意调整<code>AppTaskCreate</code>中的优先级顺序</p>
<p>在低优先级任务运行的时候，中优先级任务无法抢占低优先级的任务，低优先级任务的优先级发生翻转。</p>
</blockquote>
