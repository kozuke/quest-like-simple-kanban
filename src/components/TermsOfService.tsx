import React from 'react';
import { ArrowLeft, Shield, Scroll } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-royal-blue text-white p-4 shadow-md flex-shrink-0">
        <div className="container mx-auto flex items-center">
          <button
            onClick={onBack}
            className="flex items-center bg-blue-700 hover:bg-blue-800 transition-colors duration-200 text-white px-3 py-2 rounded mr-4"
          >
            <ArrowLeft size={18} className="mr-1" />
            戻る
          </button>
          <div className="flex items-center">
            <Scroll size={28} className="mr-3 text-gold" />
            <h1 className="text-2xl font-pixel">利用規約</h1>
          </div>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            {/* Title Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Shield size={32} className="text-royal-blue mr-3" />
                <h2 className="text-3xl font-pixel text-gray-800">Dragon Task 利用規約</h2>
              </div>
              <p className="text-gray-600 text-sm">（発効日：2025年6月1日）</p>
            </div>

            {/* Terms Content */}
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="mb-6">
                本利用規約（以下「本規約」といいます。）は、石塚 晃太（以下「当方」といいます。）が提供する RPG 風簡易看板アプリ「Dragon Task」（以下「本サービス」といいます。）の利用条件を定めるものです。利用者（以下「ユーザー」といいます。）は、本サービスを利用する前に必ず本規約をよくお読みいただき、同意の上でご利用ください。
              </p>

              <hr className="my-8 border-gray-300" />

              {/* Article 1 */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-royal-blue mb-4 flex items-center">
                  <span className="bg-royal-blue text-white px-2 py-1 rounded mr-3 text-sm">第1条</span>
                  適用
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>本規約は、本サービスの提供条件および本サービスの利用に関する当方とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当方との間の本サービス利用に関わる一切の関係に適用されます。</li>
                  <li>当方が本サービスのウェブサイト上または別途定めるプライバシーポリシーその他の規定は、本規約の一部を構成するものとします。</li>
                </ol>
              </section>

              {/* Article 2 */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-royal-blue mb-4 flex items-center">
                  <span className="bg-royal-blue text-white px-2 py-1 rounded mr-3 text-sm">第2条</span>
                  禁止事項
                </h3>
                <p className="mb-4">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>犯罪行為またはそれを助長する行為</li>
                  <li>当方または第三者の知的財産権、肖像権、プライバシーその他の権利・利益を侵害する行為</li>
                  <li>本サービスのサーバーまたはネットワークシステムに過度の負荷をかける行為、またはこれを妨害・破壊・制限する行為</li>
                  <li>本サービスのソースコード、仕組み、アルゴリズムをリバースエンジニアリング、解析、改変、複製する行為</li>
                  <li>本サービスをスクレイピング、クローリング、ボット等の自動化ツールで大量にアクセスまたはデータ取得する行為</li>
                  <li>本サービス上のコンテンツを無断で転載、配布、販売、商用利用する行為</li>
                  <li>本サービスの運営を妨害する行為、または当方が不適切と判断する行為</li>
                </ol>
              </section>

              {/* Article 3 */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-royal-blue mb-4 flex items-center">
                  <span className="bg-royal-blue text-white px-2 py-1 rounded mr-3 text-sm">第3条</span>
                  本サービスの提供の停止等
                </h3>
                <ol className="list-decimal list-inside space-y-4 ml-4">
                  <li>
                    当方は、以下のいずれかに該当する場合には、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができます。
                    <ol className="list-decimal list-inside space-y-1 ml-6 mt-2">
                      <li>本サービス用設備の保守点検または更新を行う場合</li>
                      <li>火災、停電、天災地変、戦争、暴動、労働争議その他の不可抗力により、本サービスの提供が困難となった場合</li>
                      <li>システムの不具合、第三者による不正アクセス、コンピュータウイルス感染等により、本サービスの提供が困難と判断した場合</li>
                      <li>その他、当方が本サービスの提供を困難と判断した場合</li>
                    </ol>
                  </li>
                  <li>当方は、本条に基づき当方が行った措置によりユーザーに生じた損害について、一切の責任を負いません。</li>
                </ol>
              </section>

              {/* Article 4 */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-royal-blue mb-4 flex items-center">
                  <span className="bg-royal-blue text-white px-2 py-1 rounded mr-3 text-sm">第4条</span>
                  知的財産権
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>本サービスに関する一切の知的財産権は、当方または正当な権利を有する第三者に帰属します。</li>
                  <li>ユーザーは、当方または第三者から事前の許可を得ることなく、本サービスを通じて提供される情報・画像・デザイン等を複製・転載・改変・配布・販売・出版その他二次利用してはなりません。</li>
                </ol>
              </section>

              {/* Article 5 */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-royal-blue mb-4 flex items-center">
                  <span className="bg-royal-blue text-white px-2 py-1 rounded mr-3 text-sm">第5条</span>
                  保証の否認および免責事項
                </h3>
                <ol className="list-decimal list-inside space-y-4 ml-4">
                  <li>当方は、本サービスに事実上または法律上の瑕疵（安全性・信頼性・正確性・完全性・有用性・特定目的適合性・セキュリティ等を含みますが、これらに限りません。）がないことを明示的にも黙示的にも保証しません。</li>
                  <li>
                    本サービスは <strong className="bg-gold text-blue-900 px-2 py-1 rounded">完全無料</strong> で提供され、ユーザーのブラウザの <code className="bg-gray-100 px-1 py-0.5 rounded">localStorage</code> にタスクデータや日報テンプレートを保存するのみであり、当方はその保存・バックアップ・保全について一切責任を負いません。ユーザーは自己の責任においてデータの管理を行うものとします。
                  </li>
                  <li>当方は、本サービスの利用または利用不能に関連してユーザーに生じた直接的・間接的損害（データ損失、事業機会の逸失、精神的苦痛その他一切の損害）について、当方に故意または重過失がある場合を除き、一切の責任を負いません。</li>
                  <li>本サービスは、ベータ版または改良途中の機能を含む場合があり、ユーザーはその旨を理解し自己責任で利用するものとします。</li>
                </ol>
              </section>

              {/* Article 6 */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-royal-blue mb-4 flex items-center">
                  <span className="bg-royal-blue text-white px-2 py-1 rounded mr-3 text-sm">第6条</span>
                  利用規約の変更
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>当方は、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができます。</li>
                  <li>変更後の規約は、本サービスのウェブサイト上に表示した時点で効力を生じるものとし、ユーザーが変更後に本サービスを利用した場合には、当該ユーザーは変更後の規約に同意したものとみなします。</li>
                </ol>
              </section>

              {/* Article 7 */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-royal-blue mb-4 flex items-center">
                  <span className="bg-royal-blue text-white px-2 py-1 rounded mr-3 text-sm">第7条</span>
                  連絡・通知
                </h3>
                <p className="ml-4">
                  本サービスに関する問い合わせその他ユーザーから当方への連絡または通知、および当方からユーザーへの連絡または通知は、当方が定める方法（メールアドレス：
                  <a href="mailto:kota.ishizuka1210@gmail.com" className="text-royal-blue underline hover:text-blue-800">
                    kota.ishizuka1210@gmail.com
                  </a>
                  への送付等）で行うものとします。
                </p>
              </section>

              {/* Article 8 */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-royal-blue mb-4 flex items-center">
                  <span className="bg-royal-blue text-white px-2 py-1 rounded mr-3 text-sm">第8条</span>
                  準拠法・裁判管轄
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>本規約は、日本法を準拠法とします。</li>
                  <li>本サービスに関して当方とユーザーとの間で生じた紛争については、当方所在地を管轄する <strong>東京地方裁判所</strong> を第一審の専属的合意管轄裁判所とします。</li>
                </ol>
              </section>

              <hr className="my-8 border-gray-300" />
              
              <div className="text-center text-gray-600 font-semibold">
                以上
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center py-6 mt-8">
          <p className="text-sm">© 2025 石塚 晃太 - Dragon Task</p>
        </footer>
      </main>
    </div>
  );
};

export default TermsOfService; 